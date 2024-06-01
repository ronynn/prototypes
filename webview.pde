import android.content.res.AssetManager;
import android.webkit.WebViewClient;
import android.os.Looper;
import android.content.Context;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebView;
import android.view.ViewGroup;
import android.app.Activity;
import android.widget.RelativeLayout;
import android.widget.FrameLayout;
import java.io.File;
import android.os.Bundle;
import android.os.Environment;

FrameLayout fl;
Activity act;
WebView web;
Context context;
WebViewClient wbc;
File[] files;
String[] filesPath;


public void onStart() {
  super.onStart();

  act = this.getActivity();
  wbc = new WebViewClient();
  web = new WebView(act);
  web.setLayoutParams(new RelativeLayout.LayoutParams( RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT));
  web.setWebViewClient(wbc);
  web.getSettings().setJavaScriptEnabled(true);
  web.loadUrl("data/dead-leaves.html");
  fl = (FrameLayout)act.getWindow().getDecorView().getRootView();
  fl.addView(web);
};

void setup() {
  background(255, 0, 0);
};

void draw() {
};
