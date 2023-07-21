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

- `./strfry stream wss://relay.example.com`
で別のリレーの情報を取得する

- `./strfry stream wss://relay.example.com --dir up`
で別のリレーにブロードキャストする

- `./strfry stream wss://relay.example.com --dir both`
で書き込みも読み込みもする

**別のリレーから読み込んだ情報もこのリレーに書き込まれてしまうため安易にbothにしないこと**
