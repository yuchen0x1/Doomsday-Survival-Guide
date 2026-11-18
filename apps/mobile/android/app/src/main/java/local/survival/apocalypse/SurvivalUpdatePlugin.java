package local.survival.apocalypse;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SurvivalUpdate")
public class SurvivalUpdatePlugin extends Plugin {
    @PluginMethod
    public void openRelease(PluginCall call) {
        String tag = call.getString("tag", "");
        if (tag.length() > 32 || !tag.matches("v[0-9]+\\.[0-9]+\\.[0-9]+")) {
            call.reject("发行版本号无效");
            return;
        }
        Uri release = Uri.parse("https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/" + tag);
        try {
            getActivity().startActivity(new Intent(Intent.ACTION_VIEW, release));
            call.resolve();
        } catch (ActivityNotFoundException error) {
            call.reject("未找到可以打开链接的浏览器", error);
        }
    }
}
