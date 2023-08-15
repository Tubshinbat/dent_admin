import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Upload,
  message,
  Select,
  InputNumber,
} from "antd";
import { connect } from "react-redux";
import { Editor } from "@tinymce/tinymce-react";

//Components
import PageTitle from "../../../Components/PageTitle";
import { InboxOutlined } from "@ant-design/icons";
import Loader from "../../../Components/Generals/Loader";

//Actions
import { tinymceAddPhoto } from "../../../redux/actions/imageActions";

import * as actions from "../../../redux/actions/memberActions";

// Lib
import base from "../../../base";
import axios from "../../../axios-base";
import { toastControl } from "src/lib/toasControl";
import { convertFromdata } from "../../../lib/handleFunction";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const { Dragger } = Upload;

const Add = (props) => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const [avatar, setAvatar] = useState({});
  const [deleteFile, setDeleteFile] = useState([]);
  const [status, setStatus] = useState(false);
  const [setProgress] = useState(0);
  const [loading, setLoading] = useState({
    visible: false,
    message: "",
  });

  // FUNCTIONS
  const init = () => {
    setAvatar({});
    props.getMember(props.match.params.id);
  };

  const clear = () => {
    props.clear();
    form.resetFields();
    setAvatar({});
    setLoading(false);
  };

  // -- TREE FUNCTIONS

  const handleChange = (event) => {
    form.setFieldsValue({ details: event });
  };

  const handleAdd = (values, st = null) => {
    values.status = status;
    if (st == "draft") values.status = false;
    if (avatar && avatar.name) values.picture = avatar.name;
    else values.picture = "";

    const data = {
      ...values,
    };

    if (deleteFile && deleteFile.length > 0) {
      deleteFile.map((file) => {
        axios
          .delete("/imgupload", { data: { file: file } })
          .then((succ) => {
            toastControl("success", "Амжилттай файл устгагдлаа");
          })
          .catch((error) =>
            toastControl("error", "Файл устгах явцад алдаа гарлаа")
          );
      });
    }

    const sendData = convertFromdata(data);
    props.updateMember(props.match.params.id, sendData);
  };

  const handleRemove = (stType, file) => {
    let index;

    setAvatar({});
    setDeleteFile((bf) => [...bf, file.name]);
  };

  // CONFIGS

  const uploadImage = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress({ percent: (event.loaded / event.total) * 100 });
      },
    };

    fmData.append("file", file);
    try {
      const res = await axios.post("/imgupload", fmData, config);
      const img = {
        name: res.data.data,
        url: `${base.cdnUrl}${res.data.data}`,
      };
      setAvatar(img);

      onSuccess("Ok");
      message.success(res.data.data + " Хуулагдлаа");
      return img;
    } catch (err) {
      toastControl("error", err);
      onError({ err });
      return false;
    }
  };

  const uploadOptions = {
    onRemove: (file) => handleRemove("cover", file),
    fileList: avatar && avatar.name && [avatar],
    customRequest: (options) => uploadImage(options),
    accept: "image/*",
    name: "avatar",
    listType: "picture",
    maxCount: 1,
  };

  // USEEFFECT
  useEffect(() => {
    init();
    return () => clear();
  }, []);

  // Ямар нэгэн алдаа эсвэл амжилттай үйлдэл хийгдвэл энд useEffect барьж аваад TOAST харуулна
  useEffect(() => {
    toastControl("error", props.error);
  }, [props.error]);

  useEffect(() => {
    if (props.success) {
      toastControl("success", props.success);
      setTimeout(() => props.history.replace("/members"), 2000);
    }
  }, [props.success]);

  useEffect(() => {
    if (props.member) {
      form.setFieldsValue({ ...props.member });
      setStatus(props.member.status);
      if (props.member.picture) {
        const url = base.cdnUrl + props.member.picture;
        const img = {
          name: props.member.picture,
          url,
        };
        setAvatar(img);
      }
    }
  }, [props.member]);

  return (
    <>
      <div className="content-wrapper">
        <PageTitle name="Хамт олон" />
        <div className="page-sub-menu"></div>
        <div className="content">
          <Loader show={loading.visible}> {loading.message} </Loader>
          <div className="container-fluid">
            <Form layout="vertical" form={form}>
              <div className="row">
                <div className="col-8">
                  <div className="card card-primary">
                    <div className="card-body">
                      <div className="row">
                        <div className="row">
                          <div className="col-6">
                            <Form.Item
                              label="Бүтэн нэр"
                              rules={[
                                {
                                  required: true,
                                  message: "Тус талбарыг заавал бөглөнө үү",
                                },
                                {
                                  min: 2,
                                  message: "2 -оос дээш утга оруулна уу",
                                },
                              ]}
                              name="name"
                              hasFeedback
                            >
                              <Input placeholder="Нэр оруулна уу" />
                            </Form.Item>
                          </div>

                          <div className="col-6">
                            <Form.Item
                              name="position"
                              label="Албан тушаал"
                              hasFeedback
                            >
                              <Input placeholder="Албан тушаал оруулна уу" />
                            </Form.Item>
                          </div>
                          <div className="col-12">
                            <Form.Item
                              label="Дэлгэрэнгүй танилцуулга"
                              name="about"
                              getValueFromEvent={(e) =>
                                e.target && e.target.getContent()
                              }
                              rules={[requiredRule]}
                            >
                              <Editor
                                apiKey="2nubq7tdhudthiy6wfb88xgs36os4z3f4tbtscdayg10vo1o"
                                init={{
                                  height: 300,
                                  menubar: false,
                                  plugins: [
                                    "advlist textcolor autolink lists link image charmap print preview anchor tinydrive ",
                                    "searchreplace visualblocks code fullscreen",
                                    "insertdatetime media table paste code help wordcount image media  code  table  ",
                                  ],
                                  toolbar:
                                    "mybutton | addPdf |  image | undo redo | fontselect fontsizeselect formatselect blockquote  | bold italic forecolor  backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help | link  | quickbars | media | code | tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
                                  file_picker_types: "image",
                                  tinydrive_token_provider: `${base.apiUrl}users/jwt`,
                                  automatic_uploads: false,
                                  setup: (editor) => {
                                    editor.ui.registry.addButton("mybutton", {
                                      text: "Файл оруулах",
                                      onAction: () => {
                                        var input =
                                          document.createElement("input");
                                        input.setAttribute("type", "file");
                                        input.onchange = async function () {
                                          var file = this.files[0];
                                          const fData = new FormData();
                                          fData.append("file", file);
                                          setLoading({
                                            visible: true,
                                            message:
                                              "Түр хүлээнэ үү файл хуулж байна",
                                          });
                                          const res = await axios.post(
                                            "/file",
                                            fData
                                          );
                                          const url =
                                            `${base.cdnUrl}` + res.data.data;
                                          editor.insertContent(
                                            `<a href="${url}"> ${res.data.data} </a>`
                                          );
                                          setLoading({
                                            visible: false,
                                          });
                                        };
                                        input.click();
                                      },
                                    });
                                    editor.ui.registry.addButton("addPdf", {
                                      text: "PDF Файл оруулах",
                                      onAction: () => {
                                        let input =
                                          document.createElement("input");
                                        input.setAttribute("type", "file");
                                        input.setAttribute("accept", ".pdf");
                                        input.onchange = async function () {
                                          let file = this.files[0];
                                          const fData = new FormData();
                                          fData.append("file", file);
                                          setLoading({
                                            visible: true,
                                            message:
                                              "Түр хүлээнэ үү файл хуулж байна",
                                          });
                                          const res = await axios.post(
                                            "/file",
                                            fData
                                          );
                                          const url =
                                            base.cdnUrl + res.data.data;
                                          editor.insertContent(
                                            `<iframe src="${url}" style="width:100%; min-height: 500px"> </iframe>`
                                          );
                                          setLoading({
                                            visible: false,
                                          });
                                        };
                                        input.click();
                                      },
                                    });
                                  },
                                  file_picker_callback: function (
                                    cb,
                                    value,
                                    meta
                                  ) {
                                    var input = document.createElement("input");
                                    input.setAttribute("type", "file");
                                    input.setAttribute("accept", "image/*");
                                    input.onchange = async function () {
                                      var file = this.files[0];
                                      const fData = new FormData();
                                      fData.append("file", file);
                                      const res = await axios.post(
                                        "/imgupload",
                                        fData
                                      );
                                      const url =
                                        `${base.cdnUrl}` + res.data.data;
                                      cb(url);
                                    };
                                    input.click();
                                  },
                                }}
                                onEditorChange={(event) => handleChange(event)}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card">
                    <div class="card-header">
                      <h3 class="card-title">ТОХИРГОО</h3>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6">
                          <Form.Item label="Идэвхтэй эсэх" name="status">
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              onChange={(value) => setStatus(value)}
                              checked={status}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="control-bottons">
                        <Button
                          key="submit"
                          htmlType="submit"
                          className="add-button"
                          loading={props.loading}
                          onClick={() => {
                            form
                              .validateFields()
                              .then((values) => {
                                handleAdd(values);
                              })
                              .catch((info) => {
                                // console.log(info);
                              });
                          }}
                        >
                          Нэмэх
                        </Button>
                        <Button
                          key="draft"
                          type="primary"
                          onClick={() => {
                            form
                              .validateFields()
                              .then((values) => {
                                handleAdd(values, "draft");
                              })
                              .catch((info) => {
                                // console.log(info);
                              });
                          }}
                        >
                          Ноороглох
                        </Button>
                        <Button onClick={() => props.history.goBack()}>
                          Буцах
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div class="card-header">
                      <h3 class="card-title">Нүүр зураг оруулах</h3>
                    </div>
                    <div className="card-body">
                      <Dragger
                        {...uploadOptions}
                        className="upload-list-inline"
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Зургаа энэ хэсэг рүү чирч оруулна уу
                        </p>
                        <p className="ant-upload-hint">
                          Нэг болон түүнээс дээш файл хуулах боломжтой
                        </p>
                      </Dragger>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    success: state.memberReducer.success,
    error: state.memberReducer.error,
    loading: state.memberReducer.loading,
    member: state.memberReducer.member,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tinymceAddPhoto: (file) => dispatch(tinymceAddPhoto(file)),
    getMember: (id) => dispatch(actions.getMember(id)),
    updateMember: (id, data) => dispatch(actions.updateMember(id, data)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Add);
