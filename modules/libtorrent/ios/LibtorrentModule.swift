import ExpoModulesCore

public class LibtorrentModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Libtorrent")

    Events("onTorrentProgress")

    AsyncFunction("download") { (magnetUri: String, savePath: String) in
      // It's good practice to run torrent operations off the main thread
      let wrapper = LibtorrentWrapper.sharedInstance()
      
      wrapper.downloadMagnet(magnetUri, savePath: savePath) { (progress, state) in
        self.sendEvent("onTorrentProgress", [
          "progress": progress,
          "state": state
        ])
      }
      return "Started"
    }

    AsyncFunction("stop") { () -> String in
      // TODO: Implement native libtorrent cancellation for iOS
      return "Stopped"
    }
  }
}
