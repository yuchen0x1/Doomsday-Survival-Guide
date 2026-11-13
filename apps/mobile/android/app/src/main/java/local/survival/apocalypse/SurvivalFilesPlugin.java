package local.survival.apocalypse;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Export only to a location explicitly selected by the user. No broad storage permission. */
@CapacitorPlugin(name = "SurvivalFiles")
public class SurvivalFilesPlugin extends Plugin {
    @PluginMethod
    public void saveText(PluginCall call) {
        String content = call.getString("content");
        String filename = call.getString("filename");
        if (content == null || filename == null || filename.contains("/") || filename.contains("\\")) {
            call.reject("文件内容或名称无效");
            return;
        }
        if (content.getBytes(StandardCharsets.UTF_8).length > 25 * 1024 * 1024) {
            call.reject("导出文件超过 25 MB");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(call.getString("mimeType", "text/plain"));
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        startActivityForResult(call, intent, "saveResult");
    }

    @ActivityCallback
    private void saveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            response.put("saved", false);
            call.resolve(response);
            return;
        }
        getBridge().execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(result.getData().getData(), "wt")) {
                if (stream == null) throw new java.io.IOException("无法打开目标文件");
                stream.write(call.getString("content", "").getBytes(StandardCharsets.UTF_8));
                stream.flush();
            } catch (Exception error) {
                call.reject("保存失败，请选择可写入的位置", error);
                return;
            }
            response.put("saved", true);
            call.resolve(response);
        });
    }
}
