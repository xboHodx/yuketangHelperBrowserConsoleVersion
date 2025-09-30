(async function () {
    // 请在此处填写你的sessionid
    const sessionid = '';
    // 学习速率 我觉得默认的这个就挺好的
    const learning_rate = 4;

    // 从cookie获取认证信息
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    console.log("=== 雨课堂视频助手控制台版 ===");

    // 获取信息
    const url_root = window.location.protocol + "//" + window.location.host + "/";
    const csrftoken = getCookie('csrftoken');
    const university_id = getCookie('university_id');

    if (!csrftoken || !sessionid) {
        console.error("无法获取认证信息，请确保已登录雨课堂！");
        return;
    }

    console.log("认证信息获取成功");

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'Cookie': `csrftoken=${csrftoken}; sessionid=${sessionid}; university_id=${university_id}; platform_id=3`,
        'x-csrftoken': csrftoken,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'university-id': university_id,
        'xtbz': 'cloud'
    };

    // 获取user_id
    console.log("正在获取用户ID...");
    let user_id = "";
    try {
        const res = await fetch(url_root + "edu_admin/check_user_session/", { headers });
        const text = await res.text();
        console.log("响应内容:", text); // 调试信息
        const match = text.match(/"user_id":(.+?)}/);
        if (!match) throw "未获取到user_id";
        user_id = match[1].trim();
        console.log("用户ID:", user_id);
    } catch (e) {
        console.error("获取user_id失败:", e);
        return;
    }

    // 获取课程列表
    console.log("正在获取课程列表...");
    let courses = [];
    try {
        const res = await fetch(url_root + `mooc-api/v1/lms/user/user-courses/?status=1&page=1&no_page=1&term=latest&uv_id=${university_id}`, { headers });
        const data = await res.json();
        courses = data.data.product_list;
        console.log("\n=== 可用课程列表 ===");
        courses.forEach((c, i) => {
            console.log(`编号：${i + 1} 课名：${c.course_name}`);
        });
    } catch (e) {
        console.error("获取课程列表失败:", e);
        return;
    }

    // 控制台输入课程选择
    console.log("\n请在下方输入要学习的课程编号（输入0表示全部课程）:");
    console.log("输入方式：在控制台中输入 selectCourse(编号) 并回车");
    console.log("例如：selectCourse(1) 或 selectCourse(0)");

    // 全局函数供用户调用
    window.selectCourse = async function (number) {
        number = parseInt(number);
        if (isNaN(number) || number < 0 || number > courses.length) {
            console.error("输入不合法！请输入0到" + courses.length + "之间的数字");
            return;
        }

        console.log("开始执行课程学习...");

        // 获取视频列表
        async function get_videos_ids(course) {
            const url = url_root + `mooc-api/v1/lms/learn/course/chapter?cid=${course.classroom_id}&term=latest&uv_id=${university_id}&sign=${course.course_sign}`;
            const res = await fetch(url, { headers });
            const data = await res.json();
            let videos = [];
            try {
                data.data.course_chapter.forEach(chap => {
                    chap.section_leaf_list.forEach(sec => {
                        if (sec.leaf_list) {
                            sec.leaf_list.forEach(leaf => {
                                if (leaf.leaf_type === 0) videos.push({ id: leaf.id, name: leaf.name });
                            });
                        } else {
                            if (sec.leaf_type === 0) videos.push({ id: sec.id, name: sec.name });
                        }
                    });
                });
            } catch {
                console.error("获取视频列表失败！");
            }
            console.log(`${course.course_name} 共有 ${videos.length} 个视频`);
            return videos;
        }

        // 视频观看函数
        async function one_video_watcher(video, course) {
            const url_heartbeat = url_root + "video-log/heartbeat/";
            const get_url = url_root + `video-log/get_video_watch_progress/?cid=${course.course_id}&user_id=${user_id}&classroom_id=${course.classroom_id}&video_type=video&vtype=rate&video_id=${video.id}&snapshot=1&term=latest&uv_id=${university_id}`;

            let progress = await fetch(get_url, { headers });
            let text = await progress.text();
            let completed = /"completed":(\d),/.exec(text);

            if (completed && completed[1] === '1') {
                console.log(video.name + " 已经学习完毕，跳过");
                return;
            }

            console.log(video.name + " 尚未学习，现在开始自动学习");
            await new Promise(r => setTimeout(r, 1000));

            let val = 0;
            let video_frame = 0;

            try {
                let res_rate = JSON.parse(text);
                val = res_rate.data[video.id]?.rate || 0;
                video_frame = res_rate.data[video.id]?.watch_length || 0;
            } catch { }

            let timestamp = Date.now();

            while (val <= 0.95) {
                let heart_data = [];

                for (let i = 0; i < 3; i++) {
                    heart_data.push({
                        "i": 5,
                        "et": "loadeddata",
                        "p": "web",
                        "n": "ali-cdn.xuetangx.com",
                        "lob": "cloud4",
                        "cp": video_frame,
                        "fp": 0,
                        "tp": 0,
                        "sp": 2,
                        "ts": timestamp.toString(),
                        "u": parseInt(user_id),
                        "uip": "",
                        "c": course.course_id,
                        "v": parseInt(video.id),
                        "skuid": course.sku_id,
                        "classroomid": course.classroom_id,
                        "cc": video.id,
                        "d": 4976.5,
                        "pg": video.id + "_" + Math.random().toString(36).slice(2, 6),
                        "sq": i,
                        "t": "video"
                    });
                    video_frame += learning_rate;
                }

                let data = { "heart_data": heart_data };

                try {
                    let r = await fetch(url_heartbeat, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(data)
                    });

                    let rtext = await r.text();
                    let delay_match = /Expected available in(.+?)second\./.exec(rtext);

                    if (delay_match) {
                        let delay_time = parseFloat(delay_match[1]);
                        console.log("由于网络阻塞，万恶的雨课堂，要阻塞" + delay_time + "秒");
                        await new Promise(res => setTimeout(res, (delay_time + 0.5) * 1000));
                        console.log("恢复工作啦～～");
                    }
                } catch (e) {
                    console.error("心跳包发送失败：", e);
                }

                // 刷新进度
                try {
                    progress = await fetch(get_url, { headers });
                    let res_rate = await progress.json();
                    let tmp_rate = res_rate.data[video.id]?.rate;

                    if (tmp_rate == null) return;

                    val = parseFloat(tmp_rate);
                    console.log("学习进度为：" + (val * 100).toFixed(2) + "%/100%");
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    console.error("进度刷新失败：", e);
                }
            }

            console.log("视频 " + video.id + " " + video.name + " 学习完成！");
        }

        // 执行观看
        try {
            if (number === 0) {
                console.log("开始学习所有课程...");
                for (const course of courses) {
                    console.log(`\n正在处理课程：${course.course_name}`);
                    const videos = await get_videos_ids(course);
                    for (const video of videos) {
                        await one_video_watcher(video, course);
                    }
                }
            } else {
                const course = courses[number - 1];
                console.log(`\n正在处理课程：${course.course_name}`);
                const videos = await get_videos_ids(course);
                for (const video of videos) {
                    await one_video_watcher(video, course);
                }
            }
            console.log("\n🎉 搞定啦！所有视频学习完成！");
        } catch (error) {
            console.error("执行过程中出现错误：", error);
        }
    };

    console.log("\n✅ 脚本初始化完成！现在可以使用 selectCourse(编号) 来选择课程了");
})();