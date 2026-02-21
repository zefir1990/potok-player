#import "LibtorrentWrapper.h"

// Forward declare the C++ session to avoid polluting Objective-C with C++ headers
struct LibtorrentSessionImpl;

@implementation LibtorrentWrapper {
    struct LibtorrentSessionImpl *_impl;
}

+ (instancetype)sharedInstance {
    static LibtorrentWrapper *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        // We will initialize libtorrent::session here
        // For the sake of standard React Native compilation without fighting deeply nested boost dependencies,
        // we start with a stub that returns immediate progress.
        // Full C++ initialization happens here.
    }
    return self;
}

- (void)downloadMagnet:(NSString *)magnetUri savePath:(NSString *)savePath progressCallback:(void (^)(double progress, NSString *state))callback {
    // POC stub: Simulate download progress
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        for (int i = 0; i <= 100; i += 10) {
            [NSThread sleepForTimeInterval:1.0];
            dispatch_async(dispatch_get_main_queue(), ^{
                if (callback) {
                    callback((double)i, @"Downloading");
                }
            });
        }
        dispatch_async(dispatch_get_main_queue(), ^{
            if (callback) {
                callback(100.0, @"Finished");
            }
        });
    });
}

@end
