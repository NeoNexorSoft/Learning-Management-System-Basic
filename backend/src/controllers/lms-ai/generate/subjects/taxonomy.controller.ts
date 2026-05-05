const axios = require("axios");

class TaxonomyController {
  ragApiUrl: string | undefined;
  constructor() {
    this.ragApiUrl = process.env.RAG_API_URL;
  }

  /**
   * Fetch all subjects from RAG API and store in database
   * POST /api/taxonomy/subjects
   */
  fetchSubjects = async (req: any, res: any) => {
    try {
      console.log("[Taxonomy] Starting subjects fetch...");

      const response = await axios.get(
        `${this.ragApiUrl}/api/taxonomy/subjects`,
        {
          timeout: 30000,
        },
      );

      const subjects = response.data.data || response.data;

      if (!Array.isArray(subjects)) {
        throw new Error("Invalid response format from RAG API");
      }
      return res.status(200).json({
        success: true,
        message: `Successfully fetched ${subjects.length} subjects`,
        data: {
          count: subjects.length,
          subjects: subjects,
        },
      });
    } catch (error: any) {
      console.error("[Taxonomy] Error fetching subjects:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch subjects",
        error: error.message,
      });
    }
  };

  /**
   * Fetch topics for a specific subject from RAG API and store in database
   * POST /api/taxonomy/topics
   * Body: { subject: string }
   */
  fetchTopics = async (req: any, res: any) => {
    try {
      const { subject } = req.body;

      if (!subject) {
        return res.status(400).json({
          success: false,
          message: "subject is required in request body",
        });
      }

      console.log(`[Taxonomy] Starting topics fetch for subject: ${subject}...`);

      const response = await axios.post(
        `${this.ragApiUrl}/api/subjects/topics`,
        { subject: subject },
        { timeout: 30000 },
      );

      const topics = response.data.data || response.data;

      if (!Array.isArray(topics)) {
        throw new Error("Invalid response format from RAG API");
      }

      return res.status(200).json({
        success: true,
        message: `Successfully fetched ${topics.length} topics for ${subject}`,
        data: {
          subject: subject,
          count: topics.length,
          topics: topics,
        },
      });
    } catch (error: any) {
      console.error("[Taxonomy] Error fetching topics:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch topics",
        error: error.message,
      });
    }
  };

  /**
   * Fetch subtopics for a specific subject/topic from RAG API and store in database
   * POST /api/taxonomy/subtopics
   * Body: { subject: string, topic: string }
   */
  fetchSubtopics = async (req: any, res: any) => {
    try {
      const { subject, topic } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({
          success: false,
          message: "subject and topic are required in request body",
        });
      }

      console.log(
        `[Taxonomy] Starting subtopics fetch for ${subject}/${topic}...`,
      );

      const response = await axios.post(
        `${this.ragApiUrl}/api/subjects/subtopics`,
        { subject: subject, topic: topic },
        { timeout: 30000 },
      );

      const subtopics = response.data.data || response.data;

      if (!Array.isArray(subtopics)) {
        throw new Error("Invalid response format from RAG API");
      }

      return res.status(200).json({
        success: true,
        message: `Successfully fetched ${subtopics.length} subtopics for ${subject}/${topic}`,
        data: {
          subject: subject,
          topic: topic,
          count: subtopics.length,
          subtopics: subtopics,
        },
      });
    } catch (error: any) {
      console.error("[Taxonomy] Error fetching subtopics:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch subtopics",
        error: error.message,
      });
    }
  };
}

const taxonomyController = new TaxonomyController();

export default taxonomyController;
