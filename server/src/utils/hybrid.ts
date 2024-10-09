import { Document } from "langchain/document";
import { Prisma, PrismaClient } from "@prisma/client";
import { Embeddings } from "langchain/embeddings/base";
import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import { CallbackManagerForRetrieverRun, Callbacks } from "langchain/callbacks";
import { searchInternet } from "../internet";
const prisma = new PrismaClient();
export interface DialoqbaseLibArgs extends BaseRetrieverInput {
  botId: string;
  sourceId: string | null;
  knowledge_base_ids?: string[];
}

interface SearchEmbeddingsResponse {
  id: number;
  content: string;
  metadata: object;
  similarity: number;
}

type SearchResult = [Document, number, number];

export class DialoqbaseHybridRetrival extends BaseRetriever {
  static lc_name() {
    return "DialoqbaseHybridRetrival";
  }

  lc_namespace = ["langchain", "retrievers", "dialoqbase"];
  botId: string;
  sourceId: string | null;
  embeddings: Embeddings;
  similarityK = 5;
  keywordK = 4;
  knowledge_base_ids: string[];

  constructor(embeddings: Embeddings, args: DialoqbaseLibArgs) {
    super(args);
    this.botId = args.botId;
    this.sourceId = args.sourceId;
    this.embeddings = embeddings;
    this.knowledge_base_ids = args.knowledge_base_ids || [];
  }
  async similaritySearchWithSelectedKBs(
    query: number[],
    k: number,
    knowledgeBaseIds: string[]
  ) {
    const vector = `[${query?.join(",")}]`;
    const results = await prisma.$queryRaw`
      SELECT "sourceId", "content", "metadata",
             (embedding <=> ${vector}::vector) AS distance
      FROM "BotDocument"
      WHERE "sourceId" IN (${Prisma.join(knowledgeBaseIds)})
      ORDER BY distance ASC
      LIMIT ${k}
    `
    return results as {
      sourceId: string;
      content: string;
      metadata: object;
      distance: number;
    }[];
  }
  protected async similaritySearch(
    query: string,
    k: number,
    _callbacks?: Callbacks
  ): Promise<SearchResult[]> {
    try {
      const embeddedQuery = await this.embeddings.embedQuery(query);

      const vector = `[${embeddedQuery.join(",")}]`;
      const bot_id = this.botId;
      const botInfo = await prisma.bot.findFirst({
        where: {
          id: bot_id,
        },
      });
      let result: (number | Document<object>)[][];
      const match_count = botInfo?.noOfDocumentsToRetrieve || k;

      if (this.knowledge_base_ids && this.knowledge_base_ids.length > 0) {
        const data = await this.similaritySearchWithSelectedKBs(embeddedQuery, match_count, this.knowledge_base_ids);
        result = data.map((resp) => [
          new Document({
            metadata: resp.metadata,
            pageContent: resp.content,
          }),
          1 - resp.distance,
        ]);
      } else {
        const data = await prisma.$queryRaw`
          SELECT * FROM "similarity_search_v2"(query_embedding := ${vector}::vector, botId := ${bot_id}::text,match_count := ${match_count}::int)
        `;
        result = (data as SearchEmbeddingsResponse[]).map((resp) => [
          new Document({
            metadata: resp.metadata,
            pageContent: resp.content,
          }),
          resp.similarity,
        ]);
      }


      let internetSearchResults = [];
      if (botInfo.internetSearchEnabled) {
        internetSearchResults = await searchInternet(this.embeddings, {
          query: query,
        });
      }

      const combinedResults = [...result, ...internetSearchResults];
      combinedResults.sort((a, b) => b[1] - a[1]);
      const topResults = combinedResults.slice(0, k);
      return topResults;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  protected async keywordSearch(
    query: string,
    k: number
  ): Promise<SearchResult[]> {
    const query_text = query;
    const bot_id = this.botId;

    const botInfo = await prisma.bot.findFirst({
      where: {
        id: bot_id,
      },
    });

    const match_count = botInfo?.noOfDocumentsToRetrieve || k;

    const data = await prisma.$queryRaw`
     SELECT * FROM "kw_match_documents"(query_text := ${query_text}::text, bot_id := ${bot_id}::text,match_count := ${match_count}::int)
    `;

    const result: [Document, number, number][] = (
      data as SearchEmbeddingsResponse[]
    ).map((resp) => [
      new Document({
        metadata: resp.metadata,
        pageContent: resp.content,
      }),
      resp.similarity * 10,

      resp.id,
    ]);

    // console.log("keyword search result", result)

    return result;
  }

  protected async hybridSearch(
    query: string,
    similarityK: number,
    keywordK: number,
    callbacks?: Callbacks
  ): Promise<SearchResult[]> {
    const similarity_search = this.similaritySearch(
      query,
      similarityK,
      callbacks
    );

    const keyword_search = this.keywordSearch(query, keywordK);

    return Promise.all([similarity_search, keyword_search])
      .then((results) => results.flat())
      .then((results) => {
        const picks = new Map<number, SearchResult>();

        results.forEach((result) => {
          const id = result[2];
          const nextScore = result[1];
          const prevScore = picks.get(id)?.[1];

          if (prevScore === undefined || nextScore > prevScore) {
            picks.set(id, result);
          }
        });

        return Array.from(picks.values());
      })
      .then((results) => results.sort((a, b) => b[1] - a[1]));
  }

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    const searchResults = await this.hybridSearch(
      query,
      this.similarityK,
      this.keywordK,
      runManager?.getChild("hybrid_search")
    );

    return searchResults.map(([doc]) => doc);
  }
}
