package br.com.evoluifit;

import android.app.Activity;
import android.Manifest;
import android.content.pm.PackageManager;
import android.webkit.PermissionRequest;
import android.content.ClipData;
import android.provider.MediaStore;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.IOException;
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
    private static final int STORY_PICKER = 410;
    private static final int CAMERA_PERMISSION = 411;
    private static final int NATIVE_CAMERA_PERMISSION = 412;
    private PermissionRequest pendingCamera;
    private ValueCallback<Uri[]> photoCallback;
    private Uri cameraPhoto;
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
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString()+" EvoluiFitAndroid/1.1");
        settings.setMediaPlaybackRequiresUserGesture(true);
        WebView.setWebContentsDebuggingEnabled(false);
        web.setWebChromeClient(new WebChromeClient(){
            @Override public void onPermissionRequest(PermissionRequest request){
                String[] resources = request.getResources();
                if(!trustedCameraRequest(request) || resources.length != 1
                    || !PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resources[0])){
                    request.deny();
                    return;
                }
                if(checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED){
                    request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                }else if(pendingCamera == null){
                    pendingCamera = request;
                    requestPermissions(new String[]{Manifest.permission.CAMERA},CAMERA_PERMISSION);
                }else request.deny();
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request){
                if(pendingCamera == request)pendingCamera = null;
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params){
                String[] types = params.getAcceptTypes();
                if(types.length != 1 || !"image/*".equals(types[0]))return false;
                if(photoCallback != null){callback.onReceiveValue(null);return true;}
                photoCallback = callback;
                if(params.isCaptureEnabled()){
                    if(checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED){
                        requestPermissions(new String[]{Manifest.permission.CAMERA},NATIVE_CAMERA_PERMISSION);
                        return true;
                    }
                    if(openCamera())return true;
                }
                try{
                    Intent gallery = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    gallery.addCategory(Intent.CATEGORY_OPENABLE);
                    gallery.setType("image/*");
                    startActivityForResult(gallery, STORY_PICKER);
                }catch(android.content.ActivityNotFoundException error){
                    completePhoto(null);
                    Toast.makeText(MainActivity.this,"Nenhuma galeria disponível.",Toast.LENGTH_LONG).show();
                }
                return true;
            }
        });
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
    private boolean trustedCameraRequest(PermissionRequest request){
        Uri origin = request.getOrigin();
        String currentPage = web.getUrl();
        return "https".equals(origin.getScheme()) && "jefframalho.github.io".equals(origin.getHost())
            && (origin.getPort() == -1 || origin.getPort() == 443)
            && currentPage != null && currentPage.startsWith(HOME);
    }
    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] grantResults){
        super.onRequestPermissionsResult(requestCode,permissions,grantResults);
        if(requestCode == NATIVE_CAMERA_PERMISSION){
            if(photoCallback != null && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED && openCamera())return;
            completePhoto(null);
            Toast.makeText(this,"Câmera indisponível. Confira a permissão ou use a galeria.",Toast.LENGTH_LONG).show();
            return;
        }
        if(requestCode != CAMERA_PERMISSION || pendingCamera == null)return;
        PermissionRequest request = pendingCamera;
        pendingCamera = null;
        if(grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED
            && trustedCameraRequest(request)){
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        }else request.deny();
    }
    private boolean openCamera(){
        try{
            File folder = new File(getCacheDir(), "story-photos");
            if(!folder.isDirectory() && !folder.mkdirs())return false;
            File[] previousPhotos = folder.listFiles();
            if(previousPhotos != null){
                long cutoff = System.currentTimeMillis() - 86400000L;
                for(File file : previousPhotos)if(file.lastModified() < cutoff)file.delete();
            }
            File file = File.createTempFile("story-", ".jpg", folder);
            cameraPhoto = FileProvider.getUriForFile(this,getPackageName()+".story-files",file);
            Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            camera.putExtra(MediaStore.EXTRA_OUTPUT,cameraPhoto);
            camera.setClipData(ClipData.newRawUri("Foto do treino",cameraPhoto));
            camera.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            startActivityForResult(camera,STORY_PICKER);
            return true;
        }catch(IOException | android.content.ActivityNotFoundException | SecurityException error){
            cameraPhoto = null;
            return false;
        }
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode != STORY_PICKER)return;
        Uri photo = resultCode == RESULT_OK ? (cameraPhoto != null ? cameraPhoto : data == null ? null : data.getData()) : null;
        completePhoto(photo);
    }
    private void completePhoto(Uri photo){
        ValueCallback<Uri[]> callback = photoCallback;
        photoCallback = null;
        cameraPhoto = null;
        if(callback != null)callback.onReceiveValue(photo == null ? null : new Uri[]{photo});
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
    @Override public void onDestroy(){if(pendingCamera!=null){pendingCamera.deny();pendingCamera=null;}completePhoto(null);if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}
