import React, { Component } from 'react';
import {
  StyleSheet, View, Text, Dimensions,
  ScrollView, Image,
  PermissionsAndroid,
} from 'react-native';
import { Toast, Carousel, Grid, Flex } from '@ant-design/react-native';
import Modal from 'react-native-modal';
import { Avatar, Badge, Button, Icon, Divider } from "react-native-elements";
import { RtcEngine } from 'react-native-agora';
import _ from 'lodash';
import { appid, channelProfile, audioProfile, audioScenario, defaultClient, hostClient } from '../../constants';
import { tabBarOptions, _while, _primary, _text } from '../../constants/style';
import gift from '../../constants/gift';

const { width, height } = Dimensions.get('window');
const { Event, TextMessage, Conversation } = require('leancloud-realtime');

export default class Live extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '推荐',
      tabBarOptions: {
        style: tabBarOptions.style,
        labelStyle: {
          color: _while,
        },
        indicatorStyle: {
          backgroundColor: _while,
        }
      }
    };
  };

  state = {
    clientRole: defaultClient,
    users: 0,
    message: [
      '欢迎来到连麦互动',
      '你当前的身份为观众,点击上麦可语音连麦',
    ],
    showGift: false,
    selectedGiftId: '',
    selectedGiftUsers: [],
    givAll: false,
  };

  componentWillMount() {
    const { clientRole } = this.state;
    RtcEngine.on('userJoined', (data) => {
      Toast.show('加入成功', 5);
    });
    RtcEngine.on('firstRemoteVideoDecoded', (data) => {
      Toast.show('firstRemoteVideoDecoded', 5);
    });
    RtcEngine.on('userJoined', (data) => {
      Toast.show('userJoined', 5);
    });
    RtcEngine.on('userOffline', (data) => {
      Toast.show('userOffline', 5);
    });
    RtcEngine.on('joinChannelSuccess', (data) => {
      this.setState({
        message: [].concat(this.state.message, ['你已经成功加入']),
      });
    });
    RtcEngine.on('audioVolumeIndication', (data) => {
      Toast.show('audioVolumeIndication', 5);
    })
    RtcEngine.on('clientRoleChanged', (data) => {
      Toast.show('clientRoleChanged', 5);
    })
    RtcEngine.on('error', (data) => {
      if(data.error === 17) {
        Toast.show('你已经在麦上了');
        RtcEngine.leaveChannel()
      }
    });

    RtcEngine.init({
      appid,
      channelProfile,
      clientRole,
      audioProfile,
      audioScenario,
    });

    global.realtime.createIMClient(`${new Date().getTime()}`).then(client => {
      this.setState({
        message: this.state.message.concat(['链接聊天服务器成功']),
      })
      client.on(Event.MESSAGE, function(message) {
        Toast.show('3131', 0);
      });

      client.getQuery({ name:'天南海北聊天室' }).find((conversations) => {
        return conversations[0];
      }).then((room) => {
        Toast.show(typeof room.join)
      })

      // client.createChatRoom({
      //   name: 'Hello Kitty PK 加菲猫',
      // }).then((chatRoom) => {
      //   this.setState({
      //     message: this.state.message.concat(['创建房间成功']),
      //   })
      //
      //   // chatRoom.send(new TextMessage('@Tom，我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？'));
      // });
    });
  }

  async componentDidMount() {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    ]);
    // await RtcEngine.joinChannel('test');
  }

  // 上麦
  up = async() => {
    try {
      await RtcEngine.setClientRole(hostClient);
    } catch(e) {
      Toast.show('上麦失败，请打开录音权限');
    }
  }

  // 赠送
  giving = () => {
    const { selectedGiftId, selectedGiftUsers } = this.state;
    if (!selectedGiftId) {
      return Toast.show('要选择送出的礼物哦');
    }
    if (!selectedGiftUsers.length) {
      return Toast.show('要选择送出的用户哦');
    }
  }

  render() {
    const { message, showGift, selectedGiftId, givAll } = this.state;
    const users = [
      'https://img.xiangshengclub.com/MTU1NDIwNzg5NSM5NzE=.jpg',
      'https://img.xiangshengclub.com/MTU1NDIxNzE3NSMzNDY=.jpg',
      'http://img2.inke.cn/MTU1MzM5MTA4MDY4OCMzNzMjanBn.jpg',
    ];
    const hosts = [
      new Array(4).fill(0),
      new Array(4).fill(0),
    ];

    return (
      <View style={styles.container}>
        <Image source={require('../../asset/live-bg.jpg')} style={styles.linearGradient} />
        <View style={styles.header}>
          <Text style={styles.title}>处对象</Text>
          <View style={styles.users}>
            {
              users.map(user => (
                <Avatar
                  key={user}
                  avatarStyle={styles.user}
                  containerStyle={styles.userWrap}
                  size="small"
                  rounded
                  source={{
                    uri: user,
                  }}
                  activeOpacity={0.7}
                />
              ))
            }
          </View>
        </View>
        <View>
          {
            hosts.map((item, index) => (
              <View style={styles.hostWrap} key={index}>
                {
                  item.map((item, i) => (
                    <Avatar
                      key={i}
                      overlayContainerStyle={styles.overlayContainerStyle}
                      size="medium"
                      rounded
                      icon={{name: 'user-plus', type: 'feather'}}
                      source={{
                        uri: index === 0 ? users[i] : '',
                      }}
                      activeOpacity={0.7}
                      onPress={this.up}
                    />
                  ))
                }
              </View>
            ))
          }
        </View>
        <View style={styles.messageWrap}>
          <ScrollView ref={ref => this.scrollView = ref} style={styles.messageScroll} snapToAlignment="end">
            {
              message.map(item => (
                <Text style={{ color: '#fff', }}>{item}</Text>
              ))
            }
          </ScrollView>
        </View>
        <View style={styles.action}>
          <Avatar
            rounded
            icon={{ name: 'settings-voice', type: 'material' }}
            overlayContainerStyle={styles.actionItem}
            containerStyle={styles.containerActionItem}
          />
          <View>
            <Avatar
              rounded
              icon={{name: 'message1', type: 'antdesign'}}
              overlayContainerStyle={styles.actionItem}
              containerStyle={styles.containerActionItem}
            />
            <Badge
              status="error"
              containerStyle={{ position: 'absolute', top: 6, right: 8 }}
            />
          </View>
          <Avatar
            rounded
            icon={{name: 'gift', type: 'antdesign', color: _primary }}
            overlayContainerStyle={styles.actionItem}
            containerStyle={styles.containerActionItem}
            onPress={() => this.setState({ showGift: true })}
          />
        </View>

        <Modal
          isVisible={showGift}
          backdropOpacity={0}
          onBackButtonPress={() => this.setState({ showGift: false })}
          onBackdropPress={() => this.setState({ showGift: false })}
          style={{
            justifyContent: "flex-end",
            margin: 0,
          }}
        >
          <View style={styles.gift}>
            <Flex style={styles.giftUserWrap}>
              <Text style={styles.giftUserText}>送给</Text>
              <ScrollView
                horizontal
                style={{
                  flex: 1,
                }}
              >
                {
                  users.map(user => (
                    <Avatar
                      key={user}
                      avatarStyle={styles.user}
                      containerStyle={styles.userWrap}
                      size="small"
                      rounded
                      source={{
                        uri: user,
                      }}
                      activeOpacity={0.7}
                    />
                  ))
                }
              </ScrollView>
              <Text style={{
                padding: 6,
                fontSize: 12,
                color: _text,
                borderRadius: 16,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: givAll ? _while : _text,
                backgroundColor: givAll ? _primary : 'rgba(0,0,0,0)',
              }}>全麦</Text>
            </Flex>
            <Divider style={{ backgroundColor: _text }} />
            <Carousel>
              {
                _.chunk(gift, 8).map((item, index) => (
                  <View key={index}>
                    <Grid
                      data={item}
                      hasLine={false}
                      onPress={(el) => this.setState({ selectedGiftId: el.id })}
                      renderItem={(data) => (
                        <View
                          style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: selectedGiftId === data.id ? 1 : 0,
                          borderStyle: 'solid',
                          borderColor: _primary,
                        }}>
                          <Image
                            style={styles.giftItemImage}
                            source={{ uri: data.chat_icon }}
                          />
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon iconStyle={{ marginRight: 4 }} size={14} color={_primary} type="ionicon" name="md-heart" />
                            <Text style={styles.giftGold}>{data.gold}</Text>
                          </View>
                          <Text style={styles.giftGold}>{data.name}</Text>
                        </View>
                      )}
                    />
                  </View>
                ))
              }
            </Carousel>
            <Button
              title="赠送"
              onPress={this.giving}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    color: '#fff',
  },
  users: {
    flexDirection: 'row',
  },
  userWrap: {
    marginLeft: 2,
    marginRight: 2,
    width: 26,
    height: 26,
  },
  user: {
    width: 26,
    height: 26,
  },
  hostWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  linearGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlayContainerStyle: {
    borderWidth: 1,
    borderColor: '#fff',
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  messageWrap: {
    position: 'absolute',
    width: 240,
    left: 10,
    right: 10,
    bottom: 80,
    height: 200,
  },
  messageScroll: {
    flex: 1,
  },
  action: {
    position: 'absolute',
    right: 10,
    bottom: 146,
  },
  actionItem: {
    // marginBottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  containerActionItem: {
    marginBottom: 12,
  },
  gift: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  giftItemImage: {
    width: 36,
    height: 36,
  },
  giftGold: {
    marginTop: 2,
    marginBottom: 2,
    fontSize: 12,
    color: _text,
  },
  giftUserWrap: {
    padding: 8,
  },
  giftUserText: {
    color: _while,
  },
  container: {
    position: 'relative',
    width,
    height,
  },
});
