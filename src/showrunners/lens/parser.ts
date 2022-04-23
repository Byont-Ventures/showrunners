// For mapping details see https://github.com/anudit/lenssubgraph/blob/main/src/mapping.ts

// All events:
// Followed,
// PostCreated,
// ProfileCreated,
// ProfileCreatorWhitelisted,
// FollowModuleWhitelisted,
// ReferenceModuleWhitelisted,
// CollectModuleWhitelisted,
// DispatcherSet,
// ProfileImageURISet,
// FollowNFTURISet,
// FollowModuleSet,
// CommentCreated,
// MirrorCreated

// getPost(postId)

export async function getSubscriberData(subs: Array<string>) {
  console.log(`We've got ${subs.length} subs`);
  subs.forEach((sub) => console.log(JSON.stringify(sub)));


}

export interface Followed {
  // let entity = SocialGraph.load(event.params.follower.toHexString());
  // if (!entity) {
  //   let entity = new SocialGraph(event.params.follower.toHexString());
  //   let newFollowingList: string[] = [];
  //   for (let index = 0; index < event.params.profileIds.length; index++) {
  //     const profileId = event.params.profileIds[index].toString();
  //     newFollowingList.push(profileId);
  //   }
  //   entity.following = newFollowingList;
  //   entity.save();
  // }
  // else {
  //   let newFollowingList: string[] = entity.following;
  //   for (let index = 0; index < event.params.profileIds.length; index++) {
  //     const profileId = event.params.profileIds[index].toString();
  //     newFollowingList.push(profileId);
  //   }
  //   entity.following = newFollowingList;
  //   entity.save();
  // };
}

export function parseComment(args): Comment {
  //   console.log(args);
  let postId = args.profileIdPointed.toString().concat(args.pubIdPointed.toString());

  return {
    pubId: args.pubId.toString(),
    profileId: args.profileId.toString(),
    postId: postId,
    timeStamp: new Date(args.timestamp * 1000),
  };
}

export interface Comment {
  pubId: string;
  postId: string;
  profileId: string;
  timeStamp: Date;
  //   entity.profileId = event.params.profileId;
  //   entity.pubId = event.params.pubId;
  //   entity.contentURI = event.params.contentURI.toString();
  //   entity.profileIdPointed = event.params.profileIdPointed;
  //   entity.pubIdPointed = event.params.pubIdPointed;
  //   entity.collectModule = event.params.collectModule;
  //   entity.collectModuleReturnData = event.params.collectModuleReturnData;
  //   entity.referenceModule = event.params.referenceModule;
  //   entity.referenceModuleReturnData = event.params.referenceModuleReturnData;
  //   entity.timestamp = event.params.timestamp;
}
