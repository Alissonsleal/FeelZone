import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import api from "../services/api";
import { globalStyles } from "../styles/global";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "../shared/card";
import ReviewForm from "./reviewForm";

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export default function Home({ route, navigation }) {
  const [reviews, setReview] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadContent() {
      const response = await api.get("/texts");
      const { docs } = response.data;
      console.log(docs);
      setReview(docs);
    }

    loadContent();
  }, []);

  async function addReview(review) {
    let response = await api.post("/texts", review);
    let randomKey =
      review.title +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    review._id = randomKey;
    setReview((currentReviews) => {
      return [review, ...currentReviews];
    });
    setModalOpen(false);
    console.log(response.data);
  }

  //refreshing doesn't work properly
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(1000).then(() => setRefreshing(false));

    async function loadContent() {
      const response = await api.get("/texts");
      const { docs } = response.data;
      console.log(docs);
      setReview(docs);
    }
    loadContent();
  }, []);

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor="#7f5af0"
      />
      <Modal visible={modalOpen} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
            <MaterialIcons
              name="close"
              size={24}
              onPress={() => setModalOpen(false)}
              style={styles.modalClose}
            />
            <ReviewForm addReview={addReview} reviews={reviews} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("ReviewDetails", item)}
          >
            <Card>
              <Text style={globalStyles.titleText}>{item.title}</Text>
            </Card>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={0}
            colors={[globalStyles.purple.color, globalStyles.green.color]}
            progressBackgroundColor={globalStyles.light.color}
          />
        }
      />
      <MaterialIcons
        name="add"
        size={30}
        onPress={() => setModalOpen(true)}
        style={styles.modalToggle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalToggle: {
    color: globalStyles.light.color,
    bottom: 20,
    right: 35,
    padding: 20,
    borderRadius: 35,
    alignSelf: "center",
    position: "absolute",
    backgroundColor: globalStyles.green.color,
    elevation: 4,
  },
  modalHeader: {
    flex: 1,
    backgroundColor: globalStyles.light.color,
  },
  modalContent: {
    flex: 1,
    backgroundColor: globalStyles.dark.color,
  },
  modalContentText: {
    color: globalStyles.light.color,
    fontSize: 20,
  },
  modalClose: {
    color: globalStyles.light.color,
    marginBottom: 10,
    padding: 10,
    borderRadius: 35,
    alignSelf: "center",
    backgroundColor: globalStyles.purple.color,
    marginTop: 16,
  },
});
