package local.survival.apocalypse;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SurvivalFilesPlugin.class);
        registerPlugin(SurvivalUpdatePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
