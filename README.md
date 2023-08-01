strfryの起動にメモリ4g以上必要そう

https://nostr.com/note1n8c30yurxnqd6r9qdkpqf8u4spj2ydzughk0j5a66n0sy3ps9vhqqx7tqr

https://nostr.com/note1zgvt8as744qufgallldvtvhkgcqlkx965mkw8qltvmdfh7unmlhsp9q3cf

swapの設定

http://www.momobro.com/rasbro/tips-rp-swap-management/

これやって/var/swap 　1048572

Swap: １Gi担ったこと確認できたけど

strfry error: mdb_env_open: cannot allocate memoryエラー消えず

./strfry relayも
./strfry stream .... up もだめ


# strfry-tailscale
Nostrのリレーstrfryとtailscaleを使ってお一人様リレーを立てる

tailscaleを使うことによる通信量しらんけど
書き込みリレーを絞ることで通信量の節約になるんじゃないかって


- [strfry - a nostr relay](https://github.com/hoytech/strfry) - リレー

- [tailscale](https://tailscale.com/) - あるPCかなにかに立てたローカルリレーとスマホとか別の機器につなげる


## strfry

クローンして
```
sudo apt install -y git build-essential libyaml-perl libtemplate-perl libregexp-grammars-perl libssl-dev zlib1g-dev liblmdb-dev libflatbuffers-dev libsecp256k1-dev libzstd-dev
git submodule update --init
make setup-golpe
make -j4    //-j4はプロセスの数の指定。メモリ足りないエラーが出たら -4j を外す
```
して
`./strfry relay`
したら
リレーが起動する

- 読み専リレー:`./strfry stream wss://relay.example.com`
で別のリレーの情報を取得する

- 書き専リレー:`./strfry stream wss://relay.example.com --dir up`
で別のリレーにブロードキャストする

- 読書両方:`./strfry stream wss://relay.example.com --dir both`
で書き込みも読み込みもする

**別のリレーから読み込んだ情報もこのリレーに書き込まれてしまうため安易にbothにしないこと**



### 設定ファイル-strfry.confを編集する

`bind = "127.0.0.1"`の部分を`bind = "0.0.0.0"`にする

```
(略)
relay {
    # Interface to listen on. Use 0.0.0.0 to listen on all interfaces (restart required)
    bind = "0.0.0.0" //←ここ

    # Port to open for the nostr websocket protocol (restart required)
    port = 7777

    # Set OS-limit on maximum number of open files/sockets (if 0, don't attempt to set) (restart required)
    nofiles = 1000000
(略)
```

### Write Policy
[plugins](https://github.com/hoytech/strfry/blob/master/docs/plugins.md)

## tailscaleの設定
各機器でチュートリアルのとおりにやってconnectedが出るとこまでやる

DNS⇨
HTTPS Certificates Dnable HTTPS...を押さないとだめかも

https://nostr.com/note15jh50kg9slddr3ezwashp3phunej785uyykhtma5zr7dtetnljwqnh6nek


----
## データの確認
``./strfry export > ファイル名.jsonl``　で任意のファイル名に出力できる。

jsonl（JSON LINES）
「[」と「]」による囲みが無いのと、「｛」「｝」の間に「,」がないところがJSONとの違い

export終わってもとのデータいらないならstrfry-dbの中のファイル消せばいい？


----------
# tailscaleを使わない
[darashiさんの🥦RTA](https://gist.github.com/darashi/0173182e2740a56985a871440c465df2)を使わせていただく

- denoをインストール[deno_installation](https://deno.land/manual@v1.35.3/getting_started/installation)
  適当なところで

  ```curl -fsSL https://deno.land/x/install/install.sh | sh```
  raspberry pi でやろうとしたら

  Error: Official Deno builds for Linux aarch64 are not available. (see: https://github.com/denoland/deno/issues/1846 )

ってでたから
てきとうに

```cargo install deno --locked```

てしたけどその前にエラー分で調べても結局

(https://github.com/denoland/deno/issues/1846#issuecomment-750334004)

に何かそんな感じなこと書いてるから合ってたかも？




- 適当なフォルダに🥦のmain.tsを置く

- 適当にrelayのとことかpubkey(hex)のこ編集する

- main.tsをおいたフォルダで```deno run main.ts```する

- なんか色々いいかどうか聞いてくるのでy（yes）ってする

- http://localhost:8000につながる！

- ws://localhost:8000につながる！

- 最初にこのリレーに投稿しようとしたときもコンソールになんか色々いい？って聞かれるからy(yes)ってする


### tailscale側の設定
- ws://→wss://にする
 ```sudo tailscale serve https:8445 / http://localhost:8000```
 


  cess to fetch at 'http://localhost:8000/' from origin 'https://nostr-bookmark-viewer3.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
