<?php 
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Origin: http://mysite1.com', false);
header('Access-Control-Allow-Origin: http://example.com', false);
header('Access-Control-Allow-Origin: https://www.mysite2.com', false);
header('Access-Control-Allow-Origin: http://www.mysite2.com', false);
class xmlreturn {
    public $url;
    public $author;
}
function getSongMP3($url)
{
    $link=str_replace(' mp3.zing.vn',' m.mp3.zing.vn',$url); 
    $content_encode=file_get_contents($link); 
    $content = gzdecode($content_encode);
    $xml=explode('xml="',$content); 
    $xml=explode('"',$xml[1]); 
    $xml_sub = 'http://mp3.zing.vn'.$xml[0];
   /* $data=file_get_contents($xml_sub);
    print $data;
    preg_match('/"source":"(.*)=?"/U',$data,$link); 
    $url=str_replace('\/','/',$link[1]); 
    print $data;*/
    $jsonrt = array("error" => 0,"url" => $xml_sub, "author" => "Xuan Pham");
    header('Content-type: application/json');
    return json_encode($jsonrt);
}
function _getMp3($link){ 
    $source = _viewSource($link); 
    $xml = explode('&amp;xmlURL=',$source); 
    $xml = explode('&amp;',$xml[1]); 
    $xml = $xml[0]; 
    $sourceXML = _viewSource($xml); 
    $dl = explode('<source><![CDATA[',$sourceXML); 
    $dl = explode(']]></source>',$dl[1]); 
    $dl = $dl[0]; 
    return $dl; 
} 

function _viewSource($url){ 
    $parse_url = parse_url($url); 
    $headers = array("Host: {$parse_url['host']}",
                    "Cookie:360GAME_ACCESS=true; _ga=GA1.2.699267323.1499437038; __zi=2000.26aea2152a00c25e9b11.1499269766117.b2dce05"
    ); 
    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL,$url); 
    curl_setopt($ch, CURLOPT_USERAGENT,"Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);  
    curl_setopt($ch, CURLOPT_REFERER, $url); 
    curl_setopt($ch, CURLOPT_ENCODING, 'gzip,deflate'); 
    curl_setopt($ch, CURLOPT_HEADER, false); 
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    $result = curl_exec($ch); 
    curl_close($ch); 
    return $result; 
}

if ($_GET["url"] && $_GET["keyapi"])
{
    if ($_GET['keyapi'] == 'xuandeptraikhoaito'){
        $loginUrl = 'http://mp3.zing.vn/json/song/get-source/ZmJmTknNCBmLNzHtZbxtvmLH';
        
        $result = _viewSource($loginUrl);
        echo json_encode(($result));

        //print $datad;
        //print_r(getSongMP3($_GET['url']));
    }
    else {
        $jsonrt = array("error" => 1 , "message" => "Sai api");
        print_r(json_encode($jsonrt));
    }
}else {
        $jsonrt = array("error" => 1 , "message" => "Lỗi url");
        print_r(json_encode($jsonrt));
}
//$content = file_get_contents('http://mp3.zing.vn/bai-hat/Doi-Mat-Wanbi-Tuan-Anh/ZWZAOZEW.html');
//$decoded_content = gzdecode($content);
//echo ($decoded_content);
?>