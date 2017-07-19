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
        $jsonrs_list = [];
        for($i = 0;$i< $domMP3->length;$i++)
        {
            $item = $domMP3->item($i);
            if ($item->getAttribute('title') != "" && checkisLinkSong($item->getAttribute('href')))
            {
                
                // print("link: <a href='http://mp3.zing.vn". $item->getAttribute('href')."'>".$item->getAttribute('title')."</a></br>");
                $jsonrs = array("error"=> 0,"url" => "http://mp3.zing.vn". $item->getAttribute('href'), "title" =>  $item->getAttribute('title'));
                array_push($jsonrs_list,$jsonrs);
            }
                
        }
        return $jsonrs_list;
        //return json_encode($jsonrt);
     }
     function checkisLinkSong($link){
         return split('/',$link)[1] === 'bai-hat';
     }
    $url_filter = 'http://mp3.zing.vn/tim-kiem/bai-hat.html?q=ai+biet'; 
    if ($_GET["q"] && $_GET["a"])
    {
        if ($_GET["a"] == 'xuandeptraikhoaito')
        {
            $rpe = str_replace(" ","+",$_GET["q"]);
            $url_filter = 'http://mp3.zing.vn/tim-kiem/bai-hat.html?q='.$rpe;
            echo json_encode(get_list_mp3($url_filter));
        }
        else {
            echo 'Sai API';
        }
    }else {
        echo 'Sai param';
    }
?>