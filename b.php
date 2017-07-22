<?php 
class xmlreturn {
    public $url;
    public $author;
}
function gzdecode($data,&$filename='',&$error='',$maxlength=null) 
{
    $len = strlen($data);
    if ($len < 18 || strcmp(substr($data,0,2),"\x1f\x8b")) {
        $error = "Not in GZIP format.";
        return null;  // Not GZIP format (See RFC 1952)
    }
    $method = ord(substr($data,2,1));  // Compression method
    $flags  = ord(substr($data,3,1));  // Flags
    if ($flags & 31 != $flags) {
        $error = "Reserved bits not allowed.";
        return null;
    }
    // NOTE: $mtime may be negative (PHP integer limitations)
    $mtime = unpack("V", substr($data,4,4));
    $mtime = $mtime[1];
    $xfl   = substr($data,8,1);
    $os    = substr($data,8,1);
    $headerlen = 10;
    $extralen  = 0;
    $extra     = "";
    if ($flags & 4) {
        // 2-byte length prefixed EXTRA data in header
        if ($len - $headerlen - 2 < 8) {
            return false;  // invalid
        }
        $extralen = unpack("v",substr($data,8,2));
        $extralen = $extralen[1];
        if ($len - $headerlen - 2 - $extralen < 8) {
            return false;  // invalid
        }
        $extra = substr($data,10,$extralen);
        $headerlen += 2 + $extralen;
    }
    $filenamelen = 0;
    $filename = "";
    if ($flags & 8) {
        // C-style string
        if ($len - $headerlen - 1 < 8) {
            return false; // invalid
        }
        $filenamelen = strpos(substr($data,$headerlen),chr(0));
        if ($filenamelen === false || $len - $headerlen - $filenamelen - 1 < 8) {
            return false; // invalid
        }
        $filename = substr($data,$headerlen,$filenamelen);
        $headerlen += $filenamelen + 1;
    }
    $commentlen = 0;
    $comment = "";
    if ($flags & 16) {
        // C-style string COMMENT data in header
        if ($len - $headerlen - 1 < 8) {
            return false;    // invalid
        }
        $commentlen = strpos(substr($data,$headerlen),chr(0));
        if ($commentlen === false || $len - $headerlen - $commentlen - 1 < 8) {
            return false;    // Invalid header format
        }
        $comment = substr($data,$headerlen,$commentlen);
        $headerlen += $commentlen + 1;
    }
    $headercrc = "";
    if ($flags & 2) {
        // 2-bytes (lowest order) of CRC32 on header present
        if ($len - $headerlen - 2 < 8) {
            return false;    // invalid
        }
        $calccrc = crc32(substr($data,0,$headerlen)) & 0xffff;
        $headercrc = unpack("v", substr($data,$headerlen,2));
        $headercrc = $headercrc[1];
        if ($headercrc != $calccrc) {
            $error = "Header checksum failed.";
            return false;    // Bad header CRC
        }
        $headerlen += 2;
    }
    // GZIP FOOTER
    $datacrc = unpack("V",substr($data,-8,4));
    $datacrc = sprintf('%u',$datacrc[1] & 0xFFFFFFFF);
    $isize = unpack("V",substr($data,-4));
    $isize = $isize[1];
    // decompression:
    $bodylen = $len-$headerlen-8;
    if ($bodylen < 1) {
        // IMPLEMENTATION BUG!
        return null;
    }
    $body = substr($data,$headerlen,$bodylen);
    $data = "";
    if ($bodylen > 0) {
        switch ($method) {
        case 8:
            // Currently the only supported compression method:
            $data = gzinflate($body,$maxlength);
            break;
        default:
            $error = "Unknown compression method.";
            return false;
        }
    }  // zero-byte body content is allowed
    // Verifiy CRC32
    $crc   = sprintf("%u",crc32($data));
    $crcOK = $crc == $datacrc;
    $lenOK = $isize == strlen($data);
    if (!$lenOK || !$crcOK) {
        $error = ( $lenOK ? '' : 'Length check FAILED. ') . ( $crcOK ? '' : 'Checksum FAILED.');
        return false;
    }
    return $data;
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
    $headers = array("Host: {$parse_url['host']}"); 
    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL,$url); 
    curl_setopt($ch, CURLOPT_USERAGENT,"Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);  
    curl_setopt($ch, CURLOPT_REFERER, $url); 
    curl_setopt($ch, CURLOPT_ENCODING, 'Content-encoding: Gzip'); 
    curl_setopt($ch, CURLOPT_HEADER, false); 
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    $result = curl_exec($ch); 
    curl_close($ch); 
    return $result; 
} 
print_r(_getMp3('http://mp3.zing.vn/bai-hat/Doi-Mat-Wanbi-Tuan-Anh/ZWZAOZEW.html'));
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
if ($_GET["url"] && $_GET["keyapi"])
{
    if ($_GET['keyapi'] == 'xuandeptraikhoaito'){
        print_r(getSongMP3($_GET['url']));
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