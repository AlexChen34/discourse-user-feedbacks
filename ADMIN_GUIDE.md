# User Feedbacks Admin Management

## 管理员访问方式

由于Discourse管理员菜单API的兼容性问题，管理员可以通过以下方式管理用户反馈：

### 方式1：直接URL访问
```
/admin/user_feedbacks
```

### 方式2：API接口直接操作

#### 查看所有反馈
```
GET /admin/user_feedbacks.json
```

#### 查看统计数据
```
GET /admin/user_feedbacks/stats.json
```

#### 更新反馈
```
PUT /admin/user_feedbacks/{id}.json
Content-Type: application/json

{
  "user_feedback": {
    "rating": 5,
    "review": "Updated review content"
  }
}
```

#### 删除反馈
```
DELETE /admin/user_feedbacks/{id}.json
```

### 方式3：通过用户权限控制

管理员和版主可以：
- 查看所有用户的反馈
- 编辑任何反馈的评分和评论
- 删除不当或违规的反馈
- 查看反馈统计数据

### 管理员功能特权

1. **查看隐藏的反馈**: 即使设置了隐藏反馈，管理员仍可查看所有反馈
2. **修改任何反馈**: 管理员可以修改任何用户的反馈内容
3. **删除反馈**: 管理员可以删除违规或不当的反馈
4. **操作日志**: 所有管理员操作都会记录到Discourse的操作日志中

### 故障排除

如果遇到访问问题：
1. 确认用户具有管理员或版主权限
2. 尝试直接访问API端点
3. 检查浏览器控制台是否有JavaScript错误
4. 重启Discourse以确保插件完全加载
