# yuketangHelper 网页控制台版
雨课堂刷课脚本

### 参考文献
本脚本参考了以下两位大佬的 python 脚本
1. https://github.com/heyblackC/yuketangHelper
2. https://github.com/Cat1007/yuketangHelperSCUTLite

将脚本 2 用 JavaScript 重写，使得能够在浏览器的控制台直接执行，方便不会安装 python 环境的同学

### 食用方法
以 Edge 浏览器作为参考
请务必使用`scut.yuketang.cn`，而不是其他雨课堂平台，如`changjiang.yuketang.cn`
1. 登录雨课堂网页版
2. 点击网址栏旁边的 `锁` 按钮，然后点击 `Cookie和站点数据`![image.png](https://s2.loli.net/2025/09/30/9lRqIvZGyBJDVM8.png)
3. 一路点下去找到名称为 `sessionid` 的 Cookie，将 `内容` 粘贴到脚本开头的对应位置![image.png](https://s2.loli.net/2025/09/30/sY2Mg3NoXv5p6kO.png)
![image.png](https://s2.loli.net/2025/09/30/1aoL9z8ZXktC2qr.png) 注意，要保留单引号
4. 在雨课堂页面中，按键盘上的 `F12` 打开开发者窗口，点击上方的 `控制台` 按钮
5. 输入脚本，回车，找到要刷的课的 `id`，输入 `selectCourse(id)` 来开始刷课![image.png](https://s2.loli.net/2025/09/30/wVuLaoydCizmWPE.png)


##### ps
1. 想要退出脚本的话，直接刷新网页就行了
2. 脚本开头可以设置倍速

### 吐槽
本来想做一个网页版的，html 里面套一个 js 脚本，但是由于 CORS 无法做到。
转而写控制台脚本。但是 `sessionid` 是 `HttpOnly Cookie`，暂时只能手动输入