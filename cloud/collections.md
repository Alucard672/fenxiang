# 云开发数据库集合设计

## 集合：works（作品）
### 字段
- `_id`: ObjectId（主键）
- `openid`: String（用户唯一标识）
- `title`: String（作品标题，例："未命名作品"）
- `description`: String（描述，可选）
- `cover`: String（封面图 URL）
- `images`: Array<String>（图片列表，云存储 fileID）
- `tags`: Array<String>（标签列表，例：["网页设计","UI设计"]）
- `badgeCount`: Number（图片数量，用于显示"13张图片"）
- `gradient`: String（可选，"cyan"/"red"/null，用于渐变背景）
- `createdAt`: Date（创建时间）
- `updatedAt`: Date（更新时间）

### 索引
- `openid` + `createdAt`（复合索引，用户作品列表）
- `tags`（单字段索引，标签搜索）
- `createdAt`（单字段索引，时间排序）

### 权限
- 读：仅创建者可读
- 写：仅创建者可写
- 管理员：全读写

---

## 集合：users（用户）
### 字段
- `_id`: ObjectId
- `openid`: String（唯一标识）
- `nickName`: String（昵称）
- `avatarUrl`: String（头像 URL）
- `createdAt`: Date
- `updatedAt`: Date

### 索引
- `openid`（唯一索引）

### 权限
- 读/写：仅自己
- 管理员：全读写

---

## 云存储目录
- `covers/`：封面图
- `images/`：作品内容图片

---

## 云函数规划
1. `createWork`：创建作品，上传封面，返回 workId
2. `listWorks`：分页获取用户作品列表（支持标签过滤）
3. `searchWorks`：全局/标签搜索（跨用户可选）
4. `uploadImages`：批量上传图片到云存储，返回 fileId 列表
5. `updateWork`：更新作品信息（标题、标签、描述）
6. `deleteWork`：删除作品（级联删除云存储图片）
7. `getUserInfo`：获取用户信息（昵称、头像）

---

## 安全规则
- 所有云函数均校验 `openid`，防止越权
- 文件上传限制：图片类型、单张 <= 5MB，单次最多 20 张
- 作品删除校验：仅创建者可删除