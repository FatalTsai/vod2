# README

## 如何改變/查詢讀取的目錄


改變home.controller.ts的變數,workdir（儲存目標路徑）即可
<font color =red>Basename的名稱會設定為workdir目錄的尾端</font>
:::success
ServerName/
:::
* http://192.168.151.10:3000/
可以查詢 Basename

-------------------




## 列出所有的影片(音樂/圖片)清單

#### 取得影片
* http://192.168.151.10:3000/home/=getvideo
#### 取得圖片
* http://192.168.151.10:3000/home/=getphoto
#### 取得聲音
* http://192.168.151.10:3000/home/=getsound

:::success
ServerName/Basename/=getxxxxx
:::

------------------
## 列出該目錄底下的 影片(音樂/圖片)清單

* http://192.168.151.10:3000/home/coder01/work/src/home/test=getphoto
* http://192.168.151.10:3000/home/coder01/work/src/home/test/test2=getvideo
:::success
ServerName/Basename/目標路徑=getxxxx
:::
---------------

## 讀取根目錄
:::success
ServerName/Basename
:::
*  http://192.168.151.10:3000/home

---------------
## 讀取資料夾
*   http://192.168.151.10:3000/home/coder01/work/src/home/test/test2
*   http://192.168.151.10:3000/home/coder01/work/src/home/test/1.1

以json的形式表現
    URL格式為

:::success
 ServerName/Basename/目錄路徑
:::

*  http://192.168.151.10:3000/home/lpkoo

-----
## 讀取檔案

* http://192.168.151.10:3000/home/coder01/work/src/home/hello.gif
* http://192.168.151.10:3000/home/coder01/work/src/home/test/test2/earth.mp4
* http://192.168.151.10:3000/home/coder01/work/src/home/test/test2/test3/test4/Native.mp4

URL格式為
:::success
ServerName/Basename/目標路徑/檔案名稱.副檔名
:::
如果輸入不存在的目錄 同樣會回傳404 
如果輸入非影音檔案 如 
* http://192.168.151.10:3000/home/coder01/work/src/home/flv.js

回傳403 拒絕存取

-----
## 讀取檔案資訊
* http://192.168.151.10:3000/home/coder01/work/src/home/Native.mp4=info
* http://192.168.151.10:3000/home/coder01/work/src/home/test/lux.png=info

URL格式為
:::success
ServerName/Basename/目標路徑/檔案名稱.副檔名=info
:::

-----
##  .mp4影音串流檔案

URL格式為
:::success
ServerName/Basename/目標路徑/檔案名稱.mp4=play
:::

* http://192.168.151.10:3000/home/coder01/work/src/home/Native.mp4=play
* http://192.168.151.10:3000/home/coder01/work/src/home/test/test2/test3/test4/mov_bbb.mp4=play
* http://192.168.151.10:3000/home/coder01/work/src/home/test/test2/earth.mp4=play