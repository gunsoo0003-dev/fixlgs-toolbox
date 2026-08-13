package com.fixlgs.tool001_native_provider_diag

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Log
import io.flutter.embedding.android.FlutterActivity
import java.io.FileInputStream

class MainActivity : FlutterActivity() {
    companion object {
        private const val TAG = "TOOL001_NATIVE_DIAG"
        private const val PICK_REQUEST = 42001
    }

    private var round: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        round = intent?.getIntExtra("round", 0) ?: 0
        Log.i(TAG, "NATIVE_APP_START round=$round")
        Handler(Looper.getMainLooper()).postDelayed({ launchPickerOnce() }, 450)
    }

    private fun launchPickerOnce() {
        try {
            Log.i(TAG, "NATIVE_PICKER_OPEN round=$round")
            val intent = Intent(MediaStore.ACTION_PICK_IMAGES).apply {
                type = "image/*"
            }
            startActivityForResult(intent, PICK_REQUEST)
        } catch (t: Throwable) {
            Log.e(TAG, "NATIVE_HARNESS_FAIL round=$round stage=PICKER_OPEN errorClass=${t.javaClass.name} error=${safe(t.message)}", t)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != PICK_REQUEST) return

        val uri = data?.data
        if (resultCode != Activity.RESULT_OK || uri == null) {
            Log.e(TAG, "NATIVE_HARNESS_FAIL round=$round stage=PICKER_RESULT resultCode=$resultCode uri=${uri ?: "null"}")
            return
        }

        Log.i(TAG, "NATIVE_URI round=$round scheme=${uri.scheme ?: ""} authority=${uri.authority ?: ""}")

        Thread {
            var bytes = 0L
            try {
                val pfd = contentResolver.openFileDescriptor(uri, "r")
                    ?: throw IllegalStateException("openFileDescriptor returned null")
                pfd.use { descriptor ->
                    FileInputStream(descriptor.fileDescriptor).use { input ->
                        val buffer = ByteArray(128 * 1024)
                        while (true) {
                            val n = input.read(buffer)
                            if (n < 0) break
                            bytes += n.toLong()
                        }
                    }
                }
                Log.i(TAG, "NATIVE_READ_RESULT round=$round pass=true bytes=$bytes")
            } catch (t: Throwable) {
                Log.e(TAG, "NATIVE_READ_RESULT round=$round pass=false bytes=$bytes errorClass=${t.javaClass.name} error=${safe(t.message)}", t)
            }
        }.start()
    }

    private fun safe(value: String?): String = (value ?: "").replace("\n", " ").replace("\r", " ")
}
