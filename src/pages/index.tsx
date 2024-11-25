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
  Image,
} from "react-bootstrap";
import axios from "axios";

import {
  normalizePhone,
  toPersianNumber,
  toPersianCalendar,
} from "../helper/util";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const [time, setTime] = useState<string>(times[0]);
  const [name, setName] = useState<string | undefined>("");
  const [description, setDescription] = useState<string | undefined>("");

  const [loading, setLoading] = useState<boolean>(true);
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
      setPhone(normalizePhone(tel));
      setCreateModal(true);
    }
    if (checkLogin()) getTurns();
  }, [router]);

  const handleClearQuery = () => {
    const urlWithoutQueryParams = window.location.pathname;
    window.history.replaceState({}, document.title, urlWithoutQueryParams);
  };

  const checkLogin = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUser(parsedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser}`;
      axios.defaults.headers.post["Authorization"] = `Bearer ${parsedUser}`;

      return true;
    }
    setUserModal(true);
    return false;
  };

  const handleSetLoginData = async () => {
    if (loginData) {
      const loginResponse = await tryLogin();
      const userId = loginResponse.id;
      if (userId) {
        localStorage.setItem("user", JSON.stringify(userId));
        setUser(userId);
        axios.defaults.headers.common["Authorization"] = `Bearer ${userId}`;
        axios.defaults.headers.post["Authorization"] = `Bearer ${userId}`;
        setUserModal(false);
        getTurns();
      }
    }
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
    setTime(turn.date.split(" ")[1]);
    setName(turn.refname);
    setDescription(turn.description);
    setCreateModal(true);
  };

  const emptyForm = () => {
    setPhone("");
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

  const tryLogin = async () => {
    try {
      const url = `${baseUrl}/login`;
      const response = await axios.post(url, {
        userId: loginData,
      });
      const { data } = response;
      return data;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
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
      setLoading(false);
      setError(error.message);
    }
  };
  const createTurn = async (force = true) => {
    try {
      setLoading(true);
      const url = `${baseUrl}/turn`;
      const response = await axios.post(url, {
        refname: name,
        refphone: normalizePhone(phone.toString()),
        user: user.slice(-4),
        description: description,
        date: currentDate?.faDate + " " + time,
      });
      const { data } = response;
      if (force) {
        onCloseForm(force);
      }
      await getTurns(currentDate?.faDate);
    } catch (error: any) {
      setLoading(false);
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
        refphone: normalizePhone(phone.toString()),
        user: user.slice(-4),
        description: description,
        date: currentDate?.faDate + " " + time,
      });
      const { data } = response;
      onCloseForm(true);
      await getTurns(currentDate?.faDate);
    } catch (error: any) {
      setLoading(false);
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
      setLoading(false);
      setError(error?.response?.data?.error || error.message);
    }
  };
  const sendCommentSms = async (turn: Turn) => {
    setLoading(true);
    const url = `${baseUrl}/commentSms/${turn.id}`;

    try {
      const response = await axios.put(url);
      const { data } = response;
      await getTurns(currentDate?.faDate);
    } catch (error: any) {
      setLoading(false);
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
        {loading && <div className={styles.loading}></div>}

        <Container
          className="vh-100 d-flex flex-column position-relative"
          fluid="sm"
        >
          {/* Header */}
          <Row className="py-2">
            <Col xs={"auto"}>
              <Button
                variant="info"
                className="py-2 py-sm-3 bg-gradient"
                onClick={() => getTurns("next", currentDate?.faDate)}
              >
                <span className="px-0 px-sm-2 px-md-4 text-success">
                  <i className="bi bi-chevron-double-right"></i>
                </span>
              </Button>
            </Col>
            <Col className="px-0">
              <Button
                className="w-100 py-2 py-sm-3"
                variant="primary"
                onClick={() => getTurns()}
              >
                <span className={`text-warning ${styles.fss}`}>
                  {currentDate?.day || "-"}
                </span>
                <span className={`px-2 fw-bold ${styles.fss}`} dir="ltr">
                  {toPersianNumber(currentDate?.faDate || "-")}
                </span>
                <span className={`text-warning ${styles.fss}`}>
                  {currentDate?.month || "-"}
                </span>
              </Button>
            </Col>
            <Col xs={"auto"}>
              <Button
                variant="info"
                className="py-2 py-sm-3 bg-gradient"
                onClick={() => getTurns("prev", currentDate?.faDate)}
              >
                <span className="px-0 px-sm-2 px-md-4 text-success">
                  <i className="bi bi-chevron-double-left"></i>
                </span>
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
                      <Card border="primary" className="shadow-sm h-100">
                        <Card.Header className="text-primary fw-bold">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <i className="bi bi-clock me-2"></i>
                              {toPersianNumber(turn.date.split(" ")[1])}
                            </div>
                            <div className={`text-dark ${styles.fsxs}`}>
                              {toPersianCalendar(turn.currenttime)}
                            </div>
                          </div>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-between">
                          <Card.Title className="d-flex justify-content-between gap-2 fs-6">
                            <span className={`d-block ${styles["txt-break"]}`}>
                              {turn.refname}
                            </span>
                            <span className="d-block">
                              <a
                                href={`tel:${turn.refphone}`}
                                className="link-dark"
                              >
                                {turn.refphone}
                              </a>
                              <i className="bi bi-telephone ms-1"></i>
                            </span>
                          </Card.Title>
                          <Card.Body className="p-0">
                            {turn.description && (
                              <div className="d-block my-2">
                                {turn.description}
                              </div>
                            )}
                            <div className="d-flex justify-content-between">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => sendCommentSms(turn)}
                              >
                                نظرسنجی
                                {turn.status.includes("commentSms") ? (
                                  <i className="bi bi-envelope-check-fill mx-1"></i>
                                ) : (
                                  <i className="bi bi-send mx-1"></i>
                                )}
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => onSelectTurnItem(turn)}
                              >
                                ویرایش
                              </Button>
                            </div>
                          </Card.Body>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : loading ? (
                  <></>
                ) : (
                  <div className="h-100 align-middle d-flex flex-column justify-content-center align-items-center">
                    <Image
                      src="/assets/images/empty.png"
                      alt="empty list"
                      className="h-100 mw-100"
                    />
                    <span className="mt-4 fs-4">نوبتی ثبت نشده است !</span>
                  </div>
                )}
              </Row>
            </Col>
          </Row>

          {/* FAB */}
          <Button
            variant="success"
            className={`${styles.fab} position-fixed rounded-circle opacity-50`}
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
            className={`py-2 bg-dark bg-gradient text-warning rounded-top container ${styles.offcanvasHeader}`}
            closeButton
          >
            <Offcanvas.Title>
              <i className="bi bi-calendar3"></i>
              <span className="mx-2" dir="ltr">
                {currentDate?.day}
              </span>
              <span>{toPersianNumber(currentDate?.faDate || "-")}</span>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="pt-1 bg-dark bg-gradient bg-opacity-10 container border-start border-end border-2 border-dark">
            <Form className="h-100 d-flex flex-column justify-content-between">
              <Row>
                <Col className="p-1" xs={6}>
                  <Form.Select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    {times.map((t) => (
                      <option key={t} value={t}>
                        {toPersianNumber(t)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col className="p-1" xs={6}>
                  <Form.Control
                    type="tel"
                    placeholder="شماره تماس"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-center"
                  />
                </Col>
                <Col className="p-1" xs={6}>
                  <Form.Control
                    type="text"
                    placeholder="نام"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Col>
                <Col className="p-1" xs={6}>
                  <Form.Control
                    type="text"
                    placeholder="توضیحات"
                    className="mb-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                {selectedItem ? (
                  <>
                    <Col className="p-1 ">
                      <Button
                        className="w-100"
                        variant="success"
                        onClick={editTurn}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        ویرایش
                      </Button>
                    </Col>
                    <Col className="p-1 ">
                      <Button
                        className="w-100"
                        variant="danger"
                        onClick={deleteTurn}
                      >
                        <i className="bi bi-trash me-1"></i>
                        حذف
                      </Button>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col className="p-1">
                      <Button
                        className="w-100"
                        variant="primary"
                        onClick={() => createTurn(true)}
                      >
                        <i className="bi bi-check2-square me-1"></i>
                        ثبت
                      </Button>
                    </Col>
                    <Col className="p-1">
                      <Button
                        className="w-100"
                        variant="info"
                        onClick={() => createTurn(false)}
                      >
                        <i className="bi bi-clipboard-check me-1"></i>
                        ثبت و کپی
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
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
              onChange={(e) =>
                setLoginData(e.target.value.toLowerCase().trim())
              }
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
