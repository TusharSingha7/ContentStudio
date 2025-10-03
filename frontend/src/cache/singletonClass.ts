import type { chatDetails, userDetails } from "@/types";

export class ListCache {
  private static instance: ListCache;
  private static usersList: userDetails[] = [];
  private static currentUserDetails: userDetails | null = null;
  private static chatMap = new Map<number , chatDetails[]>()
  private constructor() {}
  public static getInstance(): ListCache {
    if (!ListCache.instance) {
      ListCache.instance = new ListCache();
    }
    return ListCache.instance;
  }
  public static getUsersList(): userDetails[] {
    return this.usersList;
  }
  public static setUsersList(users: userDetails[]): void {
    this.usersList = users;
  }
  public static getCurrentUserDetails(): userDetails | null {
    return this.currentUserDetails;
  }
  public static setCurrentUserDetails(user: userDetails | null): void {
    this.currentUserDetails = user;
  }
  public static getChat(id : number) : chatDetails[] {
    if(!this.chatMap.has(id)) {
        this.chatMap.set(id , []);
    }
    return this.chatMap.get(id) || [];
  }
  public static setChat(id : number , chats : chatDetails[]) : void {
    this.chatMap.set(id , chats);
  }
  public static clearCache(): void {
    this.usersList = [];
    this.currentUserDetails = null;
    this.chatMap.clear();
  }
}
