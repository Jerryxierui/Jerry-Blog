---
outline: deep
---

# React Native 知识库

## React Native 简介

### 什么是 React Native？

React Native 是由 Facebook 开发的开源移动应用开发框架，允许开发者使用 JavaScript 和 React 来构建原生移动应用。它采用"Learn once, write anywhere"的理念，让 Web 开发者能够快速上手移动应用开发。

### 核心特性

- **跨平台开发**：一套代码同时支持 iOS 和 Android
- **原生性能**：使用原生组件，性能接近原生应用
- **热重载**：快速开发和调试
- **丰富的生态系统**：大量第三方库和组件
- **React 语法**：熟悉 React 的开发者可以快速上手

::: tip
React Native 不是混合应用框架，它编译出的是真正的原生应用。
:::

## 环境搭建

### 开发环境要求

**通用要求：**
- Node.js 16 或更高版本
- npm 或 yarn
- Git

**iOS 开发：**
- macOS 系统
- Xcode 12 或更高版本
- iOS 模拟器或真机

**Android 开发：**
- Android Studio
- Android SDK
- Android 模拟器或真机

### 安装 React Native CLI

```bash
# 全局安装 React Native CLI
npm install -g @react-native-community/cli

# 或使用 npx（推荐）
npx react-native --version
```

### 创建新项目

```bash
# 创建新的 React Native 项目
npx react-native init MyApp

# 进入项目目录
cd MyApp

# 运行 iOS 应用
npx react-native run-ios

# 运行 Android 应用
npx react-native run-android
```

## 核心组件

### 基础组件

```jsx
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const BasicComponents = () => {
  return (
    <ScrollView style={styles.container}>
      {/* 视图容器 */}
      <View style={styles.section}>
        <Text style={styles.title}>基础组件示例</Text>
        
        {/* 文本组件 */}
        <Text style={styles.text}>这是一个文本组件</Text>
        
        {/* 图片组件 */}
        <Image
          source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
          style={styles.image}
        />
        
        {/* 输入框 */}
        <TextInput
          style={styles.input}
          placeholder="请输入文本"
          placeholderTextColor="#999"
        />
        
        {/* 可触摸按钮 */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>点击按钮</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BasicComponents;
```

### 列表组件

```jsx
import React from 'react';
import {
  FlatList,
  SectionList,
  View,
  Text,
  StyleSheet,
} from 'react-native';

// FlatList 示例
const FlatListExample = () => {
  const data = [
    {id: '1', title: '项目 1'},
    {id: '2', title: '项目 2'},
    {id: '3', title: '项目 3'},
  ];

  const renderItem = ({item}) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.title}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={styles.list}
    />
  );
};

// SectionList 示例
const SectionListExample = () => {
  const sections = [
    {
      title: '水果',
      data: ['苹果', '香蕉', '橙子'],
    },
    {
      title: '蔬菜',
      data: ['胡萝卜', '西兰花', '菠菜'],
    },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item + index}
      renderItem={({item}) => (
        <View style={styles.item}>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      )}
      renderSectionHeader={({section: {title}}) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
  );
};
```

## 样式系统

### StyleSheet

```jsx
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
```

### Flexbox 布局

```jsx
const FlexboxExample = () => {
  return (
    <View style={styles.container}>
      <View style={styles.box1}>
        <Text>Box 1</Text>
      </View>
      <View style={styles.box2}>
        <Text>Box 2</Text>
      </View>
      <View style={styles.box3}>
        <Text>Box 3</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // 'row' | 'column'
    justifyContent: 'space-around', // 主轴对齐
    alignItems: 'center', // 交叉轴对齐
  },
  box1: {
    flex: 1,
    backgroundColor: 'red',
    height: 50,
  },
  box2: {
    flex: 2,
    backgroundColor: 'green',
    height: 50,
  },
  box3: {
    flex: 1,
    backgroundColor: 'blue',
    height: 50,
  },
});
```

## 导航

### React Navigation

```bash
# 安装 React Navigation
npm install @react-navigation/native

# 安装依赖
npm install react-native-screens react-native-safe-area-context

# 安装导航器
npm install @react-navigation/stack
npm install @react-navigation/bottom-tabs
npm install @react-navigation/drawer
```

### 基础导航设置

```jsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 堆栈导航
const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

// 底部标签导航
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// 主应用
const App = () => {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default App;
```

## 状态管理

### 使用 Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

```jsx
// store/store.js
import {configureStore} from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// store/counterSlice.js
import {createSlice} from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: state => {
      state.value += 1;
    },
    decrement: state => {
      state.value -= 1;
    },
  },
});

export const {increment, decrement} = counterSlice.actions;
export default counterSlice.reducer;

// App.js
import React from 'react';
import {Provider} from 'react-redux';
import {store} from './store/store';
import Counter from './components/Counter';

const App = () => {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
};
```

## 网络请求

### 使用 Fetch API

```jsx
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';

const DataFetching = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>错误: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <View style={{padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>{item.title}</Text>
          <Text style={{marginTop: 5}}>{item.body}</Text>
        </View>
      )}
    />
  );
};

export default DataFetching;
```

## 原生模块

### 访问设备功能

```jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

const DeviceFeatures = () => {
  // 打开相册
  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.error) {
        console.log('用户取消或出错');
      } else {
        console.log('选择的图片:', response.assets[0]);
      }
    });
  };

  // 打开外部链接
  const openURL = () => {
    const url = 'https://reactnative.dev';
    Linking.openURL(url).catch(err => {
      Alert.alert('错误', '无法打开链接');
    });
  };

  // 显示平台信息
  const showPlatformInfo = () => {
    Alert.alert(
      '平台信息',
      `操作系统: ${Platform.OS}\n版本: ${Platform.Version}`
    );
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={openImagePicker}>
        <Text style={buttonTextStyle}>打开相册</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={buttonStyle}
        onPress={openURL}>
        <Text style={buttonTextStyle}>打开外部链接</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={buttonStyle}
        onPress={showPlatformInfo}>
        <Text style={buttonTextStyle}>显示平台信息</Text>
      </TouchableOpacity>
    </View>
  );
};

const buttonStyle = {
  backgroundColor: '#007AFF',
  padding: 15,
  margin: 10,
  borderRadius: 5,
  minWidth: 200,
  alignItems: 'center',
};

const buttonTextStyle = {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
};
```

## 性能优化

### 列表优化

```jsx
import React, {memo} from 'react';
import {FlatList, View, Text} from 'react-native';

// 使用 memo 优化列表项
const ListItem = memo(({item}) => {
  return (
    <View style={{padding: 10, borderBottomWidth: 1}}>
      <Text>{item.title}</Text>
    </View>
  );
});

const OptimizedList = ({data}) => {
  return (
    <FlatList
      data={data}
      renderItem={({item}) => <ListItem item={item} />}
      keyExtractor={item => item.id}
      // 性能优化属性
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 60,
        offset: 60 * index,
        index,
      })}
    />
  );
};
```

### 图片优化

```jsx
import React from 'react';
import {Image} from 'react-native';
import FastImage from 'react-native-fast-image';

// 使用 FastImage 替代 Image
const OptimizedImage = () => {
  return (
    <FastImage
      style={{width: 200, height: 200}}
      source={{
        uri: 'https://example.com/image.jpg',
        priority: FastImage.priority.normal,
      }}
      resizeMode={FastImage.resizeMode.contain}
    />
  );
};
```

## 调试和测试

### 调试工具

```jsx
// 开发环境调试
if (__DEV__) {
  console.log('开发环境');
  // 启用网络检查器
  GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
}

// 使用 Flipper 调试
import {logger} from 'flipper';

logger.log('调试信息', {data: 'some data'});
```

### 单元测试

```bash
# 安装测试依赖
npm install --save-dev jest @testing-library/react-native
```

```jsx
// __tests__/Button.test.js
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Button from '../components/Button';

describe('Button', () => {
  it('应该正确渲染', () => {
    const {getByText} = render(<Button title="测试按钮" />);
    expect(getByText('测试按钮')).toBeTruthy();
  });

  it('应该响应点击事件', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <Button title="测试按钮" onPress={onPress} />
    );
    
    fireEvent.press(getByText('测试按钮'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 发布应用

### Android 发布

```bash
# 生成签名密钥
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 构建 APK
cd android
./gradlew assembleRelease

# 构建 AAB（推荐）
./gradlew bundleRelease
```

### iOS 发布

```bash
# 使用 Xcode 构建
# 1. 在 Xcode 中打开 ios/YourApp.xcworkspace
# 2. 选择 Product > Archive
# 3. 上传到 App Store Connect
```

## 常用第三方库

### UI 组件库

```bash
# React Native Elements
npm install react-native-elements react-native-vector-icons

# NativeBase
npm install native-base react-native-svg

# UI Kitten
npm install @ui-kitten/components @eva-design/eva react-native-svg
```

### 工具库

```bash
# 日期处理
npm install moment

# 网络请求
npm install axios

# 异步存储
npm install @react-native-async-storage/async-storage

# 设备信息
npm install react-native-device-info

# 权限管理
npm install react-native-permissions
```

## 最佳实践

### 项目结构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   └── ui/            # UI 组件
├── screens/            # 页面组件
├── navigation/         # 导航配置
├── services/          # API 服务
├── store/             # 状态管理
├── utils/             # 工具函数
├── constants/         # 常量定义
└── assets/            # 静态资源
    ├── images/
    └── fonts/
```

### 代码规范

```jsx
// 使用 TypeScript
interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const Button: React.FC<Props> = ({title, onPress, disabled = false}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

// 使用 ESLint 和 Prettier
// .eslintrc.js
module.exports = {
  extends: ['@react-native-community'],
  rules: {
    'react-native/no-inline-styles': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

## 参考资源

- [React Native 官方文档](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Directory](https://reactnative.directory/)
- [Awesome React Native](https://github.com/jondot/awesome-react-native)
- [React Native 中文网](https://reactnative.cn/)

## 总结

React Native 是一个强大的跨平台移动应用开发框架，它让 Web 开发者能够使用熟悉的 React 语法来构建原生移动应用。通过掌握其核心概念、组件系统、导航、状态管理等关键技术，开发者可以高效地构建高质量的移动应用。随着生态系统的不断完善，React Native 将继续是移动应用开发的重要选择。