import { User } from "./user";

export interface Streak {
  startDate: string;
  endDate: string;
  length: number;
}

export interface InsightData {
  uploads: {
    streak: {
      currentStreak: Streak;
      longestStreak: Streak;
      previous?: {
        currentStreak: Streak;
        longestStreak: Streak;
      };
    };
    total: {
      now: number;
      previous: number;
    };
    average: {
      now: number;
      previous: number;
    };
    hours: {
      [key: string]: number;
    };
    words: {
      word: string;
      count: number;
    }[];
    months: {
      series: [
        {
          name: string;
          data: {
            x: string;
            y: number;
            goals: {
              name: string;
              value: number;
            }[];
          }[];
        }
      ];
    } | null;
    days: {
      series: [
        {
          name: string;
          data: {
            x: string;
            y: number;
            goals: {
              name: string;
              value: number;
            }[];
          }[];
        }
      ];
    };
    years: {
      series: [
        {
          name: string;
          data: {
            x: string;
            y: number;
            goals: {
              name: string;
              value: number;
            }[];
          }[];
        }
      ];
    };
  };
  pulses: {
    total: {
      now: number;
      previous: number;
    };
    average: {
      now: number;
      previous: number;
    };
    platforms: {
      [key: string]: number;
    };
    days: {
      [key: string]: number;
    };
    features: {
      name: string;
      count: number;
    }[];
  };
  messages: {
    total: {
      now: number;
      previous: number;
    };
    average: {
      now: number;
      previous: number;
    };
    topChats: {
      [key: string]: number;
    };
  };
  workspaces: {};
  _version: number;
}

export interface Insight {
  type: "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate: Date;
  data: InsightData;
  userId: number;
  user: User;
  id: number;
}
