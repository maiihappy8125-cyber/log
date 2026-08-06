# サブスクLog

Netflix、Prime Video、YouTube、U-NEXTなどで見たものを記録する小さなReactアプリです。

## ローカルで動かす場合

```bash
npm install
npm run dev
```

## Vercelに公開する場合

1. このフォルダをZIPでアップロード、またはGitHubに置く
2. VercelでNew Projectを選択
3. Framework PresetはVite
4. Build Commandは`npm run build`
5. Output Directoryは`dist`
6. Deployを押す


## 保存について

この版はブラウザの localStorage に記録を保存します。
同じスマホ・同じブラウザで開く限り、ページを閉じたり再読み込みしても記録が残ります。
ただし、ブラウザの履歴やサイトデータを削除した場合、または別端末で開いた場合は記録は共有されません。
