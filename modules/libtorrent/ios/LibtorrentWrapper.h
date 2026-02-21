#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface LibtorrentWrapper : NSObject

+ (instancetype)sharedInstance;

// Starts a torrent download from a magnet link to the specified path
- (void)downloadMagnet:(NSString *)magnetUri savePath:(NSString *)savePath progressCallback:(void (^)(double progress, NSString *state))callback;

@end

NS_ASSUME_NONNULL_END
