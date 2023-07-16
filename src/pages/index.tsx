import Head from "next/head";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import styles from "@/styles/Home.module.css";

import {
  Container,
  Row,
  Button,
  Col,
  Modal,
  Form,
  Offcanvas,
  Card,
  Toast,
} from "react-bootstrap";
import axios from "axios";

const baseUrl = `http://192.168.1.103:8080`;

type Phone = string | number;

interface Turn {
  id: number | string;
  refname?: string;
  refphone: string;
  user?: string;
  description?: string;
  currenttime: string;
  date: string;
  status: string;
}

interface Date {
  faFullDate: string;
  enFullDate: string;
  faDate: string;
  enDate: string;
  month: string;
  day: string;
}

export default function Home() {
  const [user, setUser] = useState<string>("");
  const [userModal, setUserModal] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<string>("");
  const [logOut, setLogOut] = useState<boolean>(false);

  const [phone, setPhone] = useState<Phone>("");
  // const [hour, setHour] = useState<string>(hours[0]);
  // const [minute, setMinute] = useState<string>(mins[0]);
  const [time, setTime] = useState<string>(times[0]);
  const [name, setName] = useState<string | undefined>("");
  const [description, setDescription] = useState<string | undefined>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  const [error, setError] = useState<string>("");
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Turn | null>(null);

  const [query, setQuery] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  const router = useRouter();

  useEffect(() => {
    let { tel } = router.query;
    if (typeof tel === "string") {
      setPhone(tel);
      setCreateModal(true);
    }
    getTurns();
  }, [router]);

  const handleClearQuery = () => {
    const urlWithoutQueryParams = window.location.pathname;
    window.history.replaceState({}, document.title, urlWithoutQueryParams);
  };

  const checkLogin = () => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
      return true;
    }
    setUserModal(true);
    return false;
  };

  const handleSetLoginData = () => {
    localStorage.setItem("user", JSON.stringify(loginData));
    setUser(loginData);
    setUserModal(false);
  };

  const handleLogOut = () => {
    if (logOut) {
      localStorage.removeItem("user");
      setUser("");
      setUserModal(true);
      setLogOut(false);
      return;
    }
    setLogOut(true);
  };

  const onSelectTurnItem = (turn: Turn) => {
    setSelectedItem(turn);
    setPhone(turn.refphone);
    // setHour(turn.date.split(" ")[1].split(":")[0]);
    // setMinute(turn.date.split(" ")[1].split(":")[1]);
    setTime(turn.date.split(" ")[1]);
    setName(turn.refname);
    setDescription(turn.description);
    setCreateModal(true);
  };

  const emptyForm = () => {
    setPhone("");
    // setHour(hours[0]);
    // setMinute(mins[0]);
    setTime(times[0]);
    setName("");
    setDescription("");
  };

  const onCloseForm = (force = false) => {
    if (selectedItem || force) {
      handleClearQuery();
      emptyForm();
    }
    setSelectedItem(null);
    setCreateModal(false);
  };

  const getTurns = async (dateQuery?: string, currentDate?: string) => {
    try {
      setLoading(true);
      const url =
        `${baseUrl}/turns` +
        (dateQuery ? `/${dateQuery}` : "") +
        (currentDate ? `/${currentDate}` : "");
      const response = await axios.get(url);
      const { data } = response;
      setCurrentDate(data.date);
      setTurns(data.turns);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
    }
  };
  const createTurn = async (force = true) => {
    try {
      setLoading(true);
      const url = `${baseUrl}/turn`;
      const response = await axios.post(url, {
        refname: name,
        refphone: phone,
        user: user,
        description: description,
        date: currentDate?.faDate + " " + time,
      });
      const { data } = response;
      if (force) {
        onCloseForm(force);
      }
      await getTurns(currentDate?.faDate);
    } catch (error: any) {
      setError(error?.response?.data?.error || error.message);
    }
  };
  const editTurn = async () => {
    try {
      setLoading(true);
      const url = `${baseUrl}/turn`;
      const response = await axios.put(url, {
        id: selectedItem?.id,
        refname: name,
        refphone: phone,
        user: user,
        description: description,
        date: currentDate?.faDate + " " + time,
      });
      const { data } = response;
      onCloseForm(true);
      await getTurns(currentDate?.faDate);
    } catch (error: any) {
      setError(error?.response?.data?.error || error.message);
    }
  };
  const deleteTurn = async () => {
    setLoading(true);
    const url = `${baseUrl}/turn/${selectedItem?.id}`;

    try {
      const response = await axios.delete(url);
      const { data } = response;
      onCloseForm(true);
      await getTurns(currentDate?.faDate);
    } catch (error: any) {
      setError(error?.response?.data?.error || error.message);
    }
  };

  return (
    <>
      <Head>
        <title>نوبت دهی - سریتا</title>
        <meta name="description" content="Cerita Nobat" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container className="vh-100 d-flex flex-column" fluid="sm">
          {/* Header */}
          <Row className=" py-2 shadow-sm">
            <Col xs={"auto"}>
              <Button
                variant="info"
                onClick={() => getTurns("next", currentDate?.faDate)}
              >
                <span className="fw-bold">{"<"}</span>
              </Button>
            </Col>
            <Col className="px-0">
              <Button
                className="w-100"
                variant="primary"
                onClick={() => getTurns()}
              >
                <span className="text-warning">{currentDate?.day || "-"}</span>
                <span className="px-2 fw-bold" dir="ltr">
                  {currentDate?.faDate || "-"}
                </span>
                <span className="text-warning">
                  {currentDate?.month || "-"}
                </span>
              </Button>
            </Col>
            <Col xs={"auto"}>
              <Button
                variant="info"
                onClick={() => getTurns("prev", currentDate?.faDate)}
              >
                <span className="fw-bold">{">"}</span>
              </Button>
            </Col>
          </Row>

          {/* List */}
          <Row
            className={`flex-grow-1 overflow-auto pt-2 ${
              createModal ? styles.pff : styles.pf
            }`}
          >
            <Col xs={12}>
              <Row>
                {turns.length > 0 ? (
                  turns.map((turn) => (
                    <Col
                      className="mb-2"
                      key={turn.id}
                      xs={12}
                      md={6}
                      lg={4}
                      xxl={3}
                    >
                      <Card border="primary" className="shadow-sm">
                        <Card.Header className="text-primary">
                          {turn.date.split(" ")[1]}
                        </Card.Header>
                        <Card.Body>
                          <Card.Title className="d-flex gap-2 fs-6">
                            <span className="d-block flex-grow-1">
                              {turn.refphone}
                            </span>
                            <span
                              className={`d-block flex-grow-1 ${styles["txt-break"]}`}
                            >
                              {turn.refname}
                            </span>
                          </Card.Title>
                          <Card.Text className="d-flex justify-content-between gap-2">
                            <span>{turn.description}</span>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => onSelectTurnItem(turn)}
                            >
                              ویرایش
                            </Button>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <div>
                    <span>نوبتی ثبت نشده است</span>
                  </div>
                )}
              </Row>
            </Col>
          </Row>

          {/* FAB */}
          <Button
            variant="success"
            className={`${styles.fab} position-fixed rounded-5 opacity-50`}
            onClick={() => setCreateModal(true)}
          >
            +
          </Button>
          {user && (
            <Button
              variant={logOut ? "warning" : "danger"}
              className={`${styles.setting} position-fixed rounded-5 opacity-50`}
              onClick={handleLogOut}
              onBlur={() => setLogOut(false)}
            >
              خروج
            </Button>
          )}
        </Container>

        {/* From */}
        <Offcanvas
          show={createModal}
          scroll
          placement="bottom"
          backdrop={false}
          onHide={onCloseForm}
          className="border-0"
        >
          <Offcanvas.Header
            className="p-2 bg-dark bg-gradient bg-opacity-25 text-success rounded-top"
            closeButton
          >
            <Offcanvas.Title>
              <span className="mx-2">{currentDate?.day}</span>
              <span>{currentDate?.faDate}</span>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="pt-1 bg-dark bg-gradient bg-opacity-25">
            <Form>
              <Container fluid>
                <Row className="gap-2 mb-2">
                  <Col className="px-0">
                    <Form.Select
                      size="sm"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    >
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col className="px-0">
                    <Form.Control
                      type="tel"
                      size="sm"
                      placeholder="شماره تماس"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-center"
                    />
                  </Col>
                </Row>
                <Row className="gap-2 mb-2">
                  <Col className="px-0">
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="نام"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Col>
                  <Col className="px-0">
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="توضیحات"
                      className="mb-2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="gap-2">
                  {selectedItem ? (
                    <>
                      <Col className="px-0 ">
                        <Button
                          className="w-100"
                          variant="success"
                          onClick={editTurn}
                        >
                          ویرایش
                        </Button>
                      </Col>
                      <Col className="px-0 ">
                        <Button
                          className="w-100"
                          variant="danger"
                          onClick={deleteTurn}
                        >
                          حذف
                        </Button>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col className="px-0 ">
                        <Button
                          className="w-100"
                          variant="primary"
                          onClick={() => createTurn(true)}
                        >
                          ثبت
                        </Button>
                      </Col>
                      <Col className="px-0 ">
                        <Button
                          className="w-100"
                          variant="info"
                          onClick={() => createTurn(false)}
                        >
                          ثبت و کپی
                        </Button>
                      </Col>
                    </>
                  )}
                </Row>
              </Container>
            </Form>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Login */}
        <Modal show={userModal} backdrop="static" keyboard={false} centered>
          <Modal.Header>
            <Modal.Title>ثبت شناسه کاربری</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="شناسه کاربری"
              value={loginData}
              onChange={(e) => setLoginData(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              className="w-100"
              onClick={handleSetLoginData}
            >
              ورود
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast */}
        <Toast
          show={!!error}
          onClose={() => setError("")}
          className="position-fixed position-absolute top-50 start-50 translate-middle bg-danger"
        >
          <Toast.Header className="text-danger">
            <strong className="me-auto">خطا</strong>
          </Toast.Header>
          <Toast.Body className="text-light">{error}</Toast.Body>
        </Toast>
      </main>
    </>
  );
}

const hours = [
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
];
const mins = ["00", "15", "30", "45"];
const times = hours.flatMap((hour) => mins.map((min) => `${hour}:${min}`));
