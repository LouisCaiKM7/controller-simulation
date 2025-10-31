# 部署到 GitHub Pages 步骤

## 1. 推送代码到 GitHub

在你的本地终端运行以下命令：

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Add motor simulator and GitHub Pages config"

# 如果还没有连接到 GitHub 仓库，先创建仓库
# 1. 去 https://github.com/new 创建一个新仓库
# 2. 仓库名建议用: motor-simulator
# 3. 不要勾选 "Initialize with README"
# 4. 创建后，运行下面的命令（替换 YOUR_USERNAME）

git remote add origin https://github.com/YOUR_USERNAME/motor-simulator.git
git branch -M main
git push -u origin main
```

## 2. 在 GitHub 上启用 Pages

1. 去你的 GitHub 仓库页面
2. 点击 **Settings** (设置)
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 下选择 **GitHub Actions**
5. 保存

## 3. 等待自动部署

- 推送代码后，GitHub Actions 会自动运行
- 去 **Actions** 标签页查看部署进度
- 成功后，你的网站会发布在: `https://YOUR_USERNAME.github.io/motor-simulator/`

## 4. 访问你的网站

部署完成后，访问：
```
https://YOUR_USERNAME.github.io/motor-simulator/
```

## 注意事项

- 首次部署可能需要几分钟
- 每次推送到 main 分支都会自动重新部署
- 如果你的仓库名不是 `motor-simulator`，需要修改 `next.config.ts` 中的 `basePath`

## 故障排查

如果部署失败：
1. 检查 Actions 标签页的错误信息
2. 确保 Settings > Pages > Source 设置为 "GitHub Actions"
3. 确保仓库是公开的（Public）
