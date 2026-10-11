package com.nosmai.camerasdk.reactnative

import android.os.Handler
import android.os.Looper
import com.nosmai.effect.api.NosmaiBeauty
import com.nosmai.effect.api.NosmaiSDK
import com.nosmai.effect.internal.NosmaiFilterEngine
import java.util.concurrent.Executors

/** Preparation does not apply a filter or occupy the controller's visual FIFO. */
internal class NosmaiBeautyPreparation(private val mainHandler: Handler) {
  private val worker = Executors.newSingleThreadExecutor { task ->
    Thread(task, "NosmaiBeautyPrepare").apply { isDaemon = true }
  }
  @Volatile private var generation = 0L
  private var prepared = false
  private var preparing = false
  private val waiting = mutableListOf<(Boolean, Throwable?) -> Unit>()

  val isPrepared: Boolean
    get() = prepared && NosmaiSDK.isPipelineReadyFlag()

  fun prepare(completion: (Boolean, Throwable?) -> Unit) {
    if (!NosmaiSDK.isPipelineReadyFlag()) {
      completion(false, null)
      return
    }
    if (prepared) {
      completion(true, null)
      return
    }
    waiting.add(completion)
    if (preparing) return
    preparing = true
    val current = generation
    try {
      worker.execute {
        if (current != generation) return@execute
        try {
          val rendererReady = NosmaiFilterEngine.warmUpMakeup()
          val modelsSettled = current == generation &&
            NosmaiSDK.isPipelineReadyFlag() && NosmaiBeauty.prepareBeautyModels()
          mainHandler.post { finish(current, rendererReady && modelsSettled, null) }
        } catch (error: Throwable) {
          mainHandler.post { finish(current, false, error) }
        }
      }
    } catch (error: Throwable) {
      finish(current, false, error)
    }
  }

  fun invalidate() {
    if (Looper.myLooper() != Looper.getMainLooper()) {
      mainHandler.post { invalidate() }
      return
    }
    generation++
    prepared = false
    preparing = false
    val callbacks = waiting.toList()
    waiting.clear()
    callbacks.forEach { it(false, null) }
  }

  fun shutdown() {
    invalidate()
    worker.shutdownNow()
  }

  private fun finish(current: Long, ready: Boolean, error: Throwable?) {
    if (current != generation) return
    preparing = false
    prepared = ready && error == null && NosmaiSDK.isPipelineReadyFlag()
    val callbacks = waiting.toList()
    waiting.clear()
    callbacks.forEach { it(prepared, error) }
  }
}
