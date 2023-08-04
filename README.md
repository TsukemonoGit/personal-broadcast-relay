# personal-broadcast-relay と tailscale
[darashiさんの🥦RTA](https://gist.github.com/darashi/0173182e2740a56985a871440c465df2)を改造したものと[tailscale](https://tailscale.com/) を使ってお一人様ブロードキャスト専用リレーを立てる

tailscale - あるPCかなにかに立てたローカルリレーとスマホとか別の機器につなげたりできる


tailscaleを使うことによる通信量しらんけど
書き込みリレーを絞ることで通信量の節約になるんじゃないかって


# 使い方
- denoをインストール[deno_installation](https://deno.land/manual@v1.35.3/getting_started/installation)
 
> [めも]
> 
>  適当なところで
>  ```curl -fsSL https://deno.land/x/install/install.sh | sh```
> 
>  raspberry pi でやろうとしたら
> 
>  Error: Official Deno builds for Linux aarch64 are not available. (see: https://github.com/denoland/deno/issues/1846 )
> て出たので
> 
>```cargo install deno --locked```
>てした


- broadcast-relay.tsのrelayのとことかpubkey(hex)のとことかを適当に修正する

- broadcast-relay.tsをおいたフォルダで```deno run --allow-all broadcast-relay.ts```

> [めも]
> 
> ```deno run main.ts```にすると、なんか色々いいかどうか聞いてくるのでy（yes）ってする
> 
> 最初にこのリレーに投稿しようとしたときもコンソールになんか色々いい？って聞かれるからy(yes)ってする
> 
> 毎回yするの面倒なので```deno run --allow-all broadcast-relay.ts```てした


- http://localhost:8000につながる！

- ws://localhost:8000につながる！

- 実行したパソコン上でws://localhost:8000が使えるようになった

## tailscaleの設定
他のパソコン（スマホ）でも使えるようにする([参考](https://nostr.com/note15jh50kg9slddr3ezwashp3phunej785uyykhtma5zr7dtetnljwqnh6nek))

- [tailscale](https://tailscale.com/download)各機器でチュートリアルのとおりにやってconnectedが出るとこまでやる

- ws://<[admin_console](https://login.tailscale.com/admin/machines)のMachine name>:8000につながるようになった？

> ブラウザからはwsではつながらなくてws://をwss://にする必要がある

### ws://→wss://にする

- Domain consoleの🌐DNSをクリック

- 下の方の HTTPS Certificates の Enable HTTPS...を押してEnableにする

- ついでにTailnet nameを確認しておく

- リレー実行中の機器で
  - ```sudo tailscale serve https:8443 / http://localhost:8000```する
  - (wss://<machine_name>.<tailnet_name>:8443で繋がる！)

  または

  - ```sudo tailscale serve https / http://localhost:8000```する
  - (wss://<machine_name>.<tailnet_name>で繋がる！)

> [めも]
> 
> HTTPS Certificatesをenableにしないと ```journalctl -u tailscaled -f```
> でログをみたときにhttp: TLS handshake error 〜〜〜response: 400 Bad Request, domain does not have HTTPS enabledってでる


