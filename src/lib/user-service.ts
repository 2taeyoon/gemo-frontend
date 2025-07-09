import clientPromise from './mongodb';
import { getKoreanDate, formatKoreanDateTime } from '../utils/date';

export interface UserProfile {
  userId: string;
  profile: {
    name: string;
    email: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  gameData: {
    totalLevel: number;
    totalScore: number;
    kodleTotalPlayed: number;
    achievements: string[];
    lastPlayed?: Date;
  };
  preferences: {
    thema: 'light' | 'dark';
    notifications: boolean;
  };
}

export class UserService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('gemo');
    return db.collection<UserProfile>('users');
  }

  // 새 사용자 프로필 생성
  static async createUserProfile(userData: {
    userId: string;
    name: string;
    email: string;
    image?: string;
  }): Promise<UserProfile> {
    const collection = await this.getCollection();
    
    const userProfile: UserProfile = {
      userId: userData.userId,
      profile: {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        createdAt: getKoreanDate(),
        updatedAt: getKoreanDate(),
      },
      gameData: {
        totalLevel: 1,
        totalScore: 0,
        kodleTotalPlayed: 0,
        achievements: [],
      },
      preferences: {
        thema: 'light',
        notifications: true,
      }
    };

    await collection.insertOne(userProfile);
    console.log(`🎮 사용자 통합 프로필이 생성되었습니다: ${userData.email}`);
    
    return userProfile;
  }

  // 사용자 프로필 조회
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ userId });
  }

  // 게임 데이터 업데이트
  static async updateGameData(userId: string, gameData: Partial<UserProfile['gameData']>): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { userId },
      { 
        $set: { 
          ...Object.fromEntries(
            Object.entries(gameData).map(([key, value]) => [`gameData.${key}`, value])
          ),
          'profile.updatedAt': formatKoreanDateTime(getKoreanDate()),
        } 
      }
    );
    
    console.log(`🎯 사용자 ${userId}의 게임 데이터가 업데이트되었습니다`);
  }

  // 사용자 설정 업데이트
  static async updatePreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { userId },
      { 
        $set: { 
          ...Object.fromEntries(
            Object.entries(preferences).map(([key, value]) => [`preferences.${key}`, value])
          ),
          'profile.updatedAt': getKoreanDate(),
        } 
      }
    );
    
    console.log(`⚙️ 사용자 ${userId}의 설정이 업데이트되었습니다`);
  }

  // 점수 추가 (게임 완료 시)
  static async addGameScore(userId: string, score: number): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { userId },
      { 
        $inc: { 
          'gameData.totalScore': score,
          'gameData.kodleTotalPlayed': 1,
        },
        $set: {
          'gameData.lastPlayed': formatKoreanDateTime(getKoreanDate()),
        }
      }
    );
    
    console.log(`🏆 사용자 ${userId}가 ${score}점을 획득했습니다!`);
  }

  // 업적 추가
  static async addAchievement(userId: string, achievement: string): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { userId },
      { 
        $addToSet: { 'gameData.achievements': achievement },
        $set: { 'profile.updatedAt': getKoreanDate() }
      }
    );
    
    console.log(`🏅 사용자 ${userId}가 새로운 업적을 달성했습니다: ${achievement}`);
  }

  // 모든 사용자 목록 조회 (관리자용)
  static async getAllUsers(): Promise<UserProfile[]> {
    const collection = await this.getCollection();
    return await collection.find({}).sort({ 'profile.createdAt': -1 }).toArray();
  }

  // 랭킹 조회
  static async getTopScores(limit: number = 10): Promise<UserProfile[]> {
    const collection = await this.getCollection();
    return await collection
      .find({})
      .sort({ 'gameData.totalScore': -1 })
      .limit(limit)
      .toArray();
  }
} 