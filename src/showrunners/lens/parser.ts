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
