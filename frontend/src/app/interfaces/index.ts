export interface Crew {
  name: string;
  id: string;
  profile_pictures: string[];
}

export interface FestivalSuggestionData {
  name: string;
  id: string;
  members: Member[];
  suggestions: FestivalSuggestion[];
  creator: string;
}

export interface Member {
  name: string;
  id: string;
  picture_url: string;
  top_artists: string;
}

export interface FestivalSuggestion {
  name: string;
  url: string;
  location: string;
  lineup: Artist[];
  headliner_img_url: string;
  date_str: string;
  user_likings?: UserLiking[];
}

export interface Artist {
  name: string;
  id: string;
}

export interface UserLiking {
  user_id: string;
  artist_ids: string[];
}

export interface FestivalPreviewData {
  name: string;
  location: string;
  date: string;
  img: string;
}

export interface HomePreviewData {
  individual: FestivalPreviewData[];
  crew:
    | {
        name: string;
        id: string;
        member_pictures: string[];
      }
    | undefined;
}
