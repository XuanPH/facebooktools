<?php
    header('Access-Control-Allow-Origin: *'); 
    function get_list_mp3($url)
     {
        $link=str_replace(' mp3.zing.vn',' m.mp3.zing.vn',$url); 
        $content_encode=file_get_contents($link); 
        $content = gzdecode($content_encode);
        
        $dom = new DOMDocument();
        @$dom->loadHTML($content);
        $xpath = new DOMXpath($dom);
        $domMP3 = $xpath->query('//a[contains(@class, "track-log")]');
        for($i = 0;$i< $domMP3->length;$i++)
        {
            $item = $domMP3->item($i);
            if ($item->getAttribute('title') != "")
                print("link: <a href='http://mp3.zing.vn". $item->getAttribute('href')."'>".$item->getAttribute('title')."</a></br>");
        }
        //return json_encode($jsonrt);
     }
    $url_filter = 'http://mp3.zing.vn/tim-kiem/bai-hat.html?q=ai+biet'; 
    if ($_GET["q"])
    {
        $rpe = str_replace(" ","+",$_GET["q"]);
        $url_filter = 'http://mp3.zing.vn/tim-kiem/bai-hat.html?q='.$rpe;
    }
    //echo $url_filter;
    get_list_mp3($url_filter);
?>