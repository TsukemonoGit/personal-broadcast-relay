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
make -j4
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

## tailscaleの設定
各機器でチュートリアルのとおりにやってconnectedが出るとこまでやる

DNS⇨
HTTPS Certificates Dnable HTTPS...を押さないとだめかも




----
## データの確認
./strfry export > ファイル名.jsonl　で任意のファイル名に出力できる。
