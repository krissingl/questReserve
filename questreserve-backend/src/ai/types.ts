export interface LocationFilterParams {
  difficulties?: Array<'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'>;
  levelRangeMin?: number;
  levelRangeMax?: number;
  partySizeMin?: number;
  partySizeMax?: number;
  setting?: 'interior' | 'exterior';
  landscapeType?: 'tundra' | 'forest' | 'desert' | 'cave' | 'coastal' | 'volcanic' | 'urban' | 'plains' | 'mountain' | 'swamp';
  toneTags?: Array<'horror' | 'heroic' | 'comedic' | 'mystery' | 'political'>;
  runTimeMax?: number;
}

export interface WillResponse {
  message: string;
  filters: LocationFilterParams;
}
