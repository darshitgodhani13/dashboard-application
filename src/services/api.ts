import axios from "axios";
import { User } from "../types";

const API = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10_000
});

export const fetchUsers = async (): Promise<User[]> => {
  const res = await API.get<User[]>("/users");
  return res.data;
};
