const axios = require("axios");
import { LOCAL_TAXONOMY } from "./local-taxonomy.data";

class TaxonomyController {
  ragApiUrl: string | undefined;
  constructor() {
    this.ragApiUrl = process.env.RAG_API_URL;
  }

  /**
   * GET /api/taxonomy/subjects
   * Returns subjects from RAG API, falls back to local data
   */
  fetchSubjects = async (req: any, res: any) => {
    try {
      if (this.ragApiUrl) {
        const response = await axios.get(
          `${this.ragApiUrl}/api/taxonomy/subjects`,
          { timeout: 8000 }
        );
        const ragSubjects: string[] = response.data.data || response.data;
        if (Array.isArray(ragSubjects) && ragSubjects.length > 0) {
          const localSubjects = Object.keys(LOCAL_TAXONOMY);
          const merged = Array.from(new Set([...ragSubjects, ...localSubjects]));
          return res.status(200).json({
            success: true,
            message: `Successfully fetched ${merged.length} subjects`,
            data: { count: merged.length, subjects: merged },
          });
        }
      }
    } catch (error: any) {
      console.warn("[Taxonomy] RAG API unavailable, using local data:", error.message);
    }

    const localSubjects = Object.keys(LOCAL_TAXONOMY);
    return res.status(200).json({
      success: true,
      message: `Successfully fetched ${localSubjects.length} subjects (local)`,
      data: { count: localSubjects.length, subjects: localSubjects },
    });
  };

  /**
   * POST /api/taxonomy/subjects/topics
   * Body: { subject: string }
   * Always merges RAG + local topics
   */
  fetchTopics = async (req: any, res: any) => {
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "subject is required in request body",
      });
    }

    // Always get local topics first
    const localTopics: string[] = LOCAL_TAXONOMY[subject]
      ? Object.keys(LOCAL_TAXONOMY[subject])
      : [];

    try {
      if (this.ragApiUrl) {
        const response = await axios.post(
          `${this.ragApiUrl}/api/subjects/topics`,
          { subject },
          { timeout: 8000 }
        );
        const ragTopics: string[] = response.data.data || response.data;
        if (Array.isArray(ragTopics) && ragTopics.length > 0) {
          // Always merge RAG + local, local topics added at the end
          const merged = Array.from(new Set([...ragTopics, ...localTopics]));
          return res.status(200).json({
            success: true,
            message: `Successfully fetched ${merged.length} topics for ${subject}`,
            data: { subject, count: merged.length, topics: merged },
          });
        }
      }
    } catch (error: any) {
      console.warn("[Taxonomy] RAG API unavailable for topics, using local data:", error.message);
    }

    if (localTopics.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No topics found for subject: ${subject}`,
        data: { subject, count: 0, topics: [] },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully fetched ${localTopics.length} topics for ${subject} (local)`,
      data: { subject, count: localTopics.length, topics: localTopics },
    });
  };

  /**
   * POST /api/taxonomy/subjects/subtopics
   * Body: { subject: string, topic: string }
   * Always merges RAG + local subtopics
   */
  fetchSubtopics = async (req: any, res: any) => {
    const { subject, topic } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: "subject and topic are required in request body",
      });
    }

    // Always get local subtopics first
    const localSubtopics: string[] = LOCAL_TAXONOMY[subject]?.[topic] ?? [];

    try {
      if (this.ragApiUrl) {
        const response = await axios.post(
          `${this.ragApiUrl}/api/subjects/subtopics`,
          { subject, topic },
          { timeout: 8000 }
        );
        const ragSubtopics: string[] = response.data.data || response.data;
        if (Array.isArray(ragSubtopics) && ragSubtopics.length > 0) {
          // Always merge RAG + local
          const merged = Array.from(new Set([...ragSubtopics, ...localSubtopics]));
          return res.status(200).json({
            success: true,
            message: `Successfully fetched ${merged.length} subtopics for ${subject}/${topic}`,
            data: { subject, topic, count: merged.length, subtopics: merged },
          });
        }
      }
    } catch (error: any) {
      console.warn("[Taxonomy] RAG API unavailable for subtopics, using local data:", error.message);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully fetched ${localSubtopics.length} subtopics for ${subject}/${topic} (local)`,
      data: {
        subject,
        topic,
        count: localSubtopics.length,
        subtopics: localSubtopics,
      },
    });
  };
}

const taxonomyController = new TaxonomyController();

export default taxonomyController;