# Discourse User Feedbacks Plugin - Troubleshooting Guide

## 500 Internal Server Error 解决方案

### 1. 立即解决步骤

#### A. 禁用插件 (临时修复)
```bash
# 在Discourse管理界面
1. 进入 Admin > Plugins
2. 找到 "discourse-user-feedbacks" 插件
3. 点击禁用按钮
4. 重新启动Discourse
```

#### B. 检查Discourse日志
```bash
# 在服务器上查看日志
tail -f /var/discourse/shared/standalone/log/rails/production.log

# 或者在Docker容器中
cd /var/discourse
./launcher logs app
```

### 2. 常见错误和解决方法

#### 错误类型 1: YAML语法错误
**症状**: 插件加载时出现YAML解析错误
**解决方案**: 
- 修复了 `config/locales/client.en.yml` 第9行多余空格
- 检查所有YAML文件的缩进和语法

#### 错误类型 2: 数据库迁移错误
**症状**: 数据库表已存在或迁移失败
**解决方案**:
- 更新迁移文件为兼容版本 (Rails 6.1)
- 添加了表存在性检查
- 添加了索引存在性检查

#### 错误类型 3: JavaScript组件错误
**症状**: 前端组件加载失败
**解决方案**:
- 检查 ES6 语法兼容性
- 确保所有 import 语句正确
- 验证组件属性访问

### 3. 详细诊断步骤

#### 步骤 1: 检查插件状态
```ruby
# 在Rails控制台中执行
User.first.user_feedbacks_received rescue "关联未定义"
DiscourseUserFeedbacks::UserFeedback.count rescue "模型未加载"
```

#### 步骤 2: 验证数据库表
```sql
-- 检查表是否存在
SELECT * FROM information_schema.tables WHERE table_name = 'user_feedbacks';

-- 检查表结构
\d user_feedbacks;
```

#### 步骤 3: 测试基本功能
```javascript
// 在浏览器控制台中测试
fetch('/user-feedbacks/user_feedbacks', {
  method: 'GET',
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
}).then(r => r.json()).then(console.log);
```

### 4. 安全模式部署

已创建安全版本的插件配置 (`plugin-safe.rb`):
- 添加了错误处理
- 增加了加载检查
- 改进了日志记录

### 5. 回滚方案

如果问题持续存在:

1. **完全禁用插件**:
   ```bash
   # 删除插件目录
   rm -rf /var/discourse/containers/app/plugins/discourse-user-feedbacks
   
   # 重新构建Discourse
   cd /var/discourse
   ./launcher rebuild app
   ```

2. **恢复备份**:
   ```bash
   # 使用Discourse备份功能
   # Admin > Backups > Restore
   ```

### 6. 预防措施

1. **测试环境**: 始终在测试环境中先测试插件
2. **备份**: 在安装插件前创建完整备份
3. **分步部署**: 逐步启用插件功能
4. **监控**: 密切监控错误日志

### 7. 联系支持

如果上述步骤都无法解决问题:
1. 收集完整的错误日志
2. 记录Discourse版本和插件版本
3. 描述具体的错误症状和重现步骤

---

**注意**: 当前已应用的修复包括YAML语法修复和数据库迁移改进。建议重新启动Discourse以应用更改。
