package expo.modules.libtorrent

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.*
import java.io.File

class LibtorrentModule : Module() {
  private var sessionScope = CoroutineScope(Dispatchers.IO)
  // Defer jlibtorrent imports to prevent immediate crash if dependency isn't linked yet.
  
  override fun definition() = ModuleDefinition {
    Name("Libtorrent")

    Events("onTorrentProgress")

    AsyncFunction("download") { magnetUri: String, savePath: String ->
      try {
        val session = com.frostwire.jlibtorrent.SessionManager()
        session.start()
        
        val saveDir = File(savePath)
        if (!saveDir.exists()) {
          saveDir.mkdirs()
        }

        session.download(magnetUri, saveDir)

        // Poll progress (simple POC implementation)
        sessionScope.launch {
          while (true) {
            delay(1000)
            val handles = session.torrents()
            if (handles.isNotEmpty()) {
              val firstHandle = handles[0]
              val status = firstHandle.status()
              val progress = status.progress() * 100
              val state = status.state().name
              
              sendEvent("onTorrentProgress", mapOf(
                "progress" to progress,
                "state" to state
              ))

              if (status.isFinished || status.isSeeding) {
                break
              }
            }
          }
        }
        "Started"
      } catch (e: Exception) {
        throw Exception("Failed to start torrent: ${e.message}")
      }
    }

    AsyncFunction("stop") {
      // TODO: Implement actual session termination for Android
      "Stopped"
    }

    AsyncFunction("getFileUrl") { fileName: String ->
      ""
    }

    AsyncFunction("streamToElement") { fileName: String, elementId: String ->
      ""
    }
  }
}
