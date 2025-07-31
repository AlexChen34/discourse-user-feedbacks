# Discourse User Feedbacks Plugin - VPS 安装指南

## 前提条件
- 你的 Hostinger VPS 上已经安装并运行了 Discourse
- 你有 SSH 访问权限到 VPS
- Discourse 使用 Docker 容器运行

## 安装步骤

### 1. SSH 连接到你的 VPS
```bash
ssh your-username@your-vps-ip
# 替换 your-username 和 your-vps-ip 为你的实际信息
```

### 2. 导航到 Discourse 目录
```bash
cd /var/discourse
# 或者你的 Discourse 安装目录
```

### 3. 编辑 app.yml 配置文件
```bash
sudo nano containers/app.yml
```

### 4. 在 app.yml 中添加插件
在 `hooks:` 部分的 `after_code:` 下添加：

```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/AlexChen34/discourse-user-feedbacks.git
```

如果已经有其他插件，添加到现有的 git clone 命令下面：
```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/existing-plugin.git
          - git clone https://github.com/AlexChen34/discourse-user-feedbacks.git
```

### 5. 重建 Discourse 容器
```bash
sudo ./launcher rebuild app
```

这个过程可能需要 10-20 分钟，取决于你的服务器性能。

### 6. 验证安装
重建完成后，访问你的 Discourse 网站：
1. 以管理员身份登录
2. 转到 Admin → Plugins
3. 查找 "discourse-user-feedbacks" 插件
4. 确保状态显示为 "Enabled"

### 7. 配置插件设置
在 Admin → Settings 中搜索 "user_feedbacks" 来配置插件选项：

- `user_feedbacks_enabled` - 启用/禁用插件
- `user_feedbacks_allow_reviews` - 允许文字评论
- `user_feedbacks_display_average_ratings_on_user_card` - 在用户卡片显示评分
- `user_feedbacks_display_average_ratings_beside_username_on_post` - 在帖子中用户名旁显示评分
- `user_feedbacks_display_average_ratings_on_profile` - 在用户资料页显示评分
- `user_feedbacks_hide_feedbacks_from_user` - 对普通用户隐藏反馈

## 故障排除

### 如果重建失败：
1. 检查 app.yml 语法是否正确（YAML 对缩进敏感）
2. 确保 GitHub 仓库地址正确
3. 检查服务器磁盘空间是否充足

### 查看构建日志：
```bash
sudo ./launcher logs app
```

### 如果插件未显示：
1. 检查插件是否正确下载到 `/var/discourse/shared/standalone/plugins/` 目录
2. 确保插件文件权限正确
3. 重新运行重建命令

## 更新插件
当你的 GitHub 仓库有更新时：
```bash
cd /var/discourse
sudo ./launcher rebuild app
```

Docker 会自动拉取最新版本。

## 手动更新（如果需要）
```bash
# 进入插件目录
sudo docker exec -it app bash
cd /var/www/discourse/plugins/discourse-user-feedbacks
git pull origin main
exit

# 重建容器
sudo ./launcher rebuild app
```

## 备份建议
在安装新插件前，建议备份你的 Discourse 数据：
```bash
sudo ./launcher enter app
discourse backup
exit
```

## 联系支持
如果遇到问题，请检查：
1. Discourse 版本是否为 3.3.0+
2. 插件是否与你的 Discourse 版本兼容
3. 服务器日志中的错误信息

---

**注意**: 请将上述命令中的占位符替换为你的实际信息。如果你的 Discourse 安装路径不同，请相应调整路径。
