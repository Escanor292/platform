import { BaseMongoService } from './base-mongo.service';
import { Document } from 'mongodb';

export interface CampaignContent extends Document {
  campaignId: string;
  version: number;
  sections: {
    type: 'TEXT' | 'IMAGE_GALLERY' | 'VIDEO' | 'FAQ' | 'TIMELINE' | 'CUSTOM';
    title?: string;
    content: any; // Flexible JSON for different section types
    order: number;
  }[];
  mediaGallery: {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    caption?: string;
  }[];
  customFields: Record<string, any>;
  isDraft: boolean;
  lastSavedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class CampaignContentService extends BaseMongoService {
  protected collectionName = 'campaign_contents';
  protected featureFlag = 'ENABLE_MONGO_CAMPAIGN_CONTENT';

  /**
   * Save campaign content/draft
   */
  public async saveContent(data: Omit<CampaignContent, 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection<CampaignContent>();
    if (!collection) return null;

    const result = await collection.updateOne(
      { campaignId: data.campaignId, isDraft: data.isDraft },
      { 
        $set: { 
          ...data, 
          updatedAt: new Date() 
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return result;
  }

  /**
   * Get campaign content
   */
  public async getContent(campaignId: string, isDraft = false) {
    const collection = await this.getCollection<CampaignContent>();
    if (!collection) return null;

    return collection.findOne({ campaignId, isDraft });
  }

  /**
   * Ensure indexes for campaign content
   */
  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<CampaignContent>();
    if (!collection) return;

    await collection.createIndex({ campaignId: 1, isDraft: 1 });
  }
}

export const campaignContentService = new CampaignContentService();
