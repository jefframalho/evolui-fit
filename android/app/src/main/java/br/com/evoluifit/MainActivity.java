package br.com.evoluifit;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebSettings;
import android.widget.LinearLayout;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView web;
    private LinearLayout root;
    private LinearLayout errorPanel;
    private static final String HOME = "https://jefframalho.github.io/evolui-fit/";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(13,16,15));
        root.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        setContentView(root);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(13,16,15));
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString()+" EvoluiFitAndroid/1.1");
        settings.setMediaPlaybackRequiresUserGesture(true);
        WebView.setWebContentsDebuggingEnabled(false);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri url=request.getUrl();
                if("https".equals(url.getScheme())&&"jefframalho.github.io".equals(url.getHost())&&url.getPath()!=null&&url.getPath().startsWith("/evolui-fit/"))return false;
                if("https".equals(url.getScheme()))openExternal(url);
                return true;
            }
            @Override public void onPageFinished(WebView view,String url){ if(errorPanel!=null&&errorPanel.getVisibility()==View.VISIBLE)return;web.setVisibility(View.VISIBLE); }
            @Override public void onReceivedError(WebView view,WebResourceRequest req,WebResourceError err){ if(req.isForMainFrame())showError(); }
        });
        web.setDownloadListener((url,userAgent,contentDisposition,mimeType,contentLength)->{Uri uri=Uri.parse(url);if("https".equals(uri.getScheme()))openExternal(uri);});
        if(state==null)web.loadUrl(HOME);else web.restoreState(state);
    }
    private void openExternal(Uri uri){try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){Toast.makeText(this,"Nenhum aplicativo disponível para abrir esse link.",Toast.LENGTH_LONG).show();}}
    private void showError(){
        web.setVisibility(View.GONE);
        if(errorPanel==null){
            errorPanel=new LinearLayout(this);errorPanel.setOrientation(LinearLayout.VERTICAL);errorPanel.setPadding(40,100,40,40);
            TextView title=new TextView(this);title.setText("Vamos reconectar sua jornada");title.setTextColor(Color.WHITE);title.setTextSize(23);errorPanel.addView(title);
            TextView hint=new TextView(this);hint.setText("O Evolui Fit precisa de internet para abrir e sincronizar seus registros. Confira sua conexão.");hint.setTextColor(Color.LTGRAY);hint.setPadding(0,25,0,25);errorPanel.addView(hint);
            Button retry=new Button(this);retry.setText("Tentar novamente");retry.setOnClickListener(v->{errorPanel.setVisibility(View.GONE);web.setVisibility(View.VISIBLE);web.loadUrl(HOME);});errorPanel.addView(retry);root.addView(errorPanel,new LinearLayout.LayoutParams(-1,-1));
        }
        errorPanel.setVisibility(View.VISIBLE);
    }
    @Override public void onSaveInstanceState(Bundle out){super.onSaveInstanceState(out);web.saveState(out);}
    @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
    @Override public void onDestroy(){if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}
