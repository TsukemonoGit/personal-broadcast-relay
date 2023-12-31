# strfry のめも

[strfry - a nostr relay](https://github.com/hoytech/strfry) - リレー
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
----
## データの確認
``./strfry export > ファイル名.jsonl``　で任意のファイル名に出力できる。

jsonl（JSON LINES）
「[」と「]」による囲みが無いのと、「｛」「｝」の間に「,」がないところがJSONとの違い

export終わってもとのデータいらないならstrfry-dbの中のファイル消せばいい？


### Write Policy
[plugins](https://github.com/hoytech/strfry/blob/master/docs/plugins.md)

-------
### 結構メモリ食う

4GB以上必要そう

メモリ足りない場合SWAP設定でどうにかなるかもならないかも
（私の環境ではならなかったかも）

https://nostr.com/note1n8c30yurxnqd6r9qdkpqf8u4spj2ydzughk0j5a66n0sy3ps9vhqqx7tqr

https://nostr.com/note1zgvt8as744qufgallldvtvhkgcqlkx965mkw8qltvmdfh7unmlhsp9q3cf

swapの設定

http://www.momobro.com/rasbro/tips-rp-swap-management/

これやって/var/swap 　1048572

Swap: １Gi担ったこと確認できたけど

strfry error: mdb_env_open: cannot allocate memoryエラー消えず

./strfry relayも
./strfry stream .... up もだめ