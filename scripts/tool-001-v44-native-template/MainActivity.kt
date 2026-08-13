package com.fixlgs.tool001_native_provider_diag

import android.app.Activity
import android.content.Intent
import android.database.Cursor
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Log
import io.flutter.embedding.android.FlutterActivity
import java.io.FileInputStream

class MainActivity : FlutterActivity() {
    companion object {
        private const val TAG = "TOOL001_NATIVE_DIAG"
        private const val PICK_REQUEST = 42001
    }

    private var round: Int = 0
    private var mode: String = "GET_CONTENT"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        round = intent?.getIntExtra("round", 0) ?: 0
        mode = intent?.getStringExtra("mode") ?: "GET_CONTENT"
        Log.i(TAG, "NATIVE_APP_START round=$round mode=$mode")
        Handler(Looper.getMainLooper()).postDelayed({ launchPickerOnce() }, 450)
    }

    private fun launchPickerOnce() {
        try {
            val pickerIntent = when (mode) {
                "PICK_IMAGES" -> Intent(MediaStore.ACTION_PICK_IMAGES).apply {
                    type = "image/*"
                }
                else -> Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*"))
                }
            }
            Log.i(TAG, "NATIVE_PICKER_OPEN round=$round mode=$mode action=${pickerIntent.action} type=${pickerIntent.type}")
            startActivityForResult(pickerIntent, PICK_REQUEST)
        } catch (t: Throwable) {
            Log.e(TAG, "NATIVE_HARNESS_FAIL round=$round mode=$mode stage=PICKER_OPEN errorClass=${t.javaClass.name} error=${safe(t.message)}", t)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != PICK_REQUEST) return

        val uri = data?.data
        if (resultCode != Activity.RESULT_OK || uri == null) {
            Log.e(TAG, "NATIVE_HARNESS_FAIL round=$round mode=$mode stage=PICKER_RESULT resultCode=$resultCode uri=${uri ?: "null"}")
            return
        }

        var displayName = ""
        var declaredSize = -1L
        try {
            contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE), null, null, null)?.use { c ->
                if (c.moveToFirst()) {
                    val ni = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    val si = c.getColumnIndex(OpenableColumns.SIZE)
                    if (ni >= 0) displayName = c.getString(ni) ?: ""
                    if (si >= 0 && !c.isNull(si)) declaredSize = c.getLong(si)
                }
            }
        } catch (_: Throwable) {}

        Log.i(TAG, "NATIVE_URI round=$round mode=$mode scheme=${uri.scheme ?: ""} authority=${uri.authority ?: ""} name=${safe(displayName)} declaredSize=$declaredSize")

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
                Log.i(TAG, "NATIVE_READ_RESULT round=$round mode=$mode pass=true bytes=$bytes")
            } catch (t: Throwable) {
                Log.e(TAG, "NATIVE_READ_RESULT round=$round mode=$mode pass=false bytes=$bytes errorClass=${t.javaClass.name} error=${safe(t.message)}", t)
            }
        }.start()
    }

    private fun safe(value: String?): String = (value ?: "").replace("\n", " ").replace("\r", " ")
}
