export type MultilingualTitle = {
  zhHans: string;
  zhHant?: string;
  en?: string;
};

export type ContentKind = "series" | "movie";

export type SubtitleTrack = "zh-Hans" | "en";

export type Episode = {
  code: string;
  season: number | null;
  number: number | null;
  title: MultilingualTitle;
  durationSec: number;
  playable: boolean;
  airDate: string | null;
  description: string;
  subtitleTracks: SubtitleTrack[];
  hasDanmaku: boolean;
};

export type Season = {
  number: number;
  episodes: Episode[];
};

export type Series = {
  slug: string;
  code: string;
  kind: ContentKind;
  title: MultilingualTitle;
  year: number;
  decade: `${number}s`;
  genres: string[];
  summary: string;
  seasons: Season[];
  episodeCount: number;
  playableEpisodeCount: number;
};

export type WatchProgress = {
  slug: string;
  episodeCode: string;
  positionSec: number;
  durationSec: number;
  updatedAt: string;
  completed: boolean;
};

export type NotificationKind =
  | "new-episode"
  | "reply"
  | "danmaku-approved"
  | "system";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  targetPath: string;
};

export type CommentAuthor = {
  name: string;
  avatar: string;
};

export type CommentReply = {
  id: string;
  author: CommentAuthor;
  createdAt: string;
  content: string;
  likes: number;
  likedByMe: boolean;
};

export type CommentItem = {
  id: string;
  author: CommentAuthor;
  createdAt: string;
  content: string;
  likes: number;
  likedByMe: boolean;
  replies: CommentReply[];
};

export type DanmakuMode = "scroll" | "top" | "bottom";

export type DanmakuItem = {
  id: string;
  timeSec: number;
  content: string;
  mode: DanmakuMode;
  color: string | null;
  likes: number;
};

export type AdminRole = "admin" | "uploader" | "member";

export type AdminUserStatus = "active" | "suspended";

export type AdminUser = {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  joinedAt: string;
  lastActiveAt: string;
};

export type InviteRecord = {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
  note: string;
};

export type UploadStage =
  | "queued"
  | "probing"
  | "transcoding"
  | "packaging"
  | "done"
  | "failed";

export type UploadJob = {
  id: string;
  seriesSlug: string;
  episodeCode: string;
  stage: UploadStage;
  progress: number;
  attempts: number;
  updatedAt: string;
  error: string | null;
};

export type ModerationStatus = "pending" | "kept" | "removed";

export type ModerationTarget = "comment" | "danmaku";

export type ModerationItem = {
  id: string;
  target: ModerationTarget;
  excerpt: string;
  author: string;
  reporter: string;
  reason: string;
  status: ModerationStatus;
  createdAt: string;
};

export type PublicationStatus = "published" | "draft";

export type ContentAdminRecord = {
  slug: string;
  status: PublicationStatus;
  updatedAt: string;
};

export type StatsDay = {
  date: string;
  plays: number;
  newMembers: number;
};

export type TopSeriesEntry = {
  slug: string;
  plays: number;
};

export type MemberProfile = {
  name: string;
  handle: string;
  email: string;
  avatar: string;
  bio: string;
  joinedAt: string;
};

export type CommentKey = `${string}:${string}`;
