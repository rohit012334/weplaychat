import React, { ChangeEvent, useEffect, useState } from "react";
import RootLayout from "../../component/layout/Layout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ExInput, Textarea } from "@/extra/Input";
import { useSelector } from "react-redux";
import { isLoading, isSkeleton } from "@/utils/allSelector";
import { RootStore, useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { baseURL, key } from "@/utils/config";
import male from "@/assets/images/male.png";
import { getResellerProfile, updateResellerProfile } from "@/store/resellerSlice";
import Button from "@/extra/Button";
import ReactSelect from "react-select";
import countriesData from "@/api/countries.json";
import { auth } from "@/component/lib/firebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import coin from "@/assets/images/coin.png";

const resellerProfile = () => {
  const { reseller } = useSelector((state: any) => state.reseller);
  const { setting }: any = useSelector((state: RootStore) => state?.setting);

  const loader = useSelector(isLoading);
  const roleSkeleton = useSelector(isSkeleton);
  const router = useRouter();
  const [loadingCountries, setLoadingCountries] = useState(false);

  const updatedImagePath = reseller?.image?.replace(/\\/g, "/");
  const dispatch = useAppDispatch();

  const [countryOptions, setCountryOptions] = useState<any[]>([]); // All countries
  const [selectedCountry, setSelectedCountry] = useState<any>(null); // Selected country

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState<any>("");
  const [description, setDescription] = useState("");
  const [mobile, setMobile] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [isBlock, setIsBlock] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [imagePath, setImagePath] = useState<any>();
  const [error, setError] = useState({
    name: "",
    countryCode: "",
    mobile: "",
    email: "",
    password: "",
    country: "",
    description: "",
    image: "",
    imagePath: "",
  });

  useEffect(() => {
    dispatch(getResellerProfile());
  }, [dispatch]);

  useEffect(() => {
    setName(reseller?.name);
    setEmail(reseller?.email);
    setPassword(reseller?.password);
    setCountryCode(reseller?.countryCode);
    setDescription(reseller?.description);
    setMobile(reseller?.mobile);
    setUniqueId(reseller?.uniqueId);
    setIsBlock(reseller?.isBlock);
    if (updatedImagePath) {
      setImagePath(baseURL + updatedImagePath);
    }
  }, [reseller]);

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
      setImagePath(URL.createObjectURL(event.target.files[0]));
    }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!name || !email || !mobile) {
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("mobile", mobile);
  formData.append("description", description || "");

  if (password) {
    formData.append("password", password);
  }

  if (image) {
    formData.append("image", image);
  }

  dispatch(updateResellerProfile(formData));
};

  return (
    <div className="mainProfile">
      <RootLayout>
        <div className="profileSetting">
          <div className="profileHead">
            <h2>Reseller Profile</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="profileImage">
                  <div className="imageBox">
                    <img
                      src={imagePath || male.src}
                      alt="profile"
                      onError={(e) => {
                        e.currentTarget.src = male.src;
                      }}
                    />
                  </div>
                  <div className="uploadButton">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      id="upload"
                      hidden
                    />
                    <label htmlFor="upload" className="uploadBtn">
                      <i className="fa fa-camera"></i>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="profileDetails">
                  <div className="row">
                    <div className="col-12">
                      <ExInput
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        label="Name"
                        placeholder="Name"
                        errorMessage={error.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setName(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <ExInput
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        label="Email"
                        placeholder="Email"
                        errorMessage={error.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <ExInput
                        type="text"
                        id="mobile"
                        name="mobile"
                        value={mobile}
                        label="Mobile"
                        placeholder="Mobile"
                        errorMessage={error.mobile}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <ExInput
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        label="Password"
                        placeholder="Password"
                        errorMessage={error.password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setPassword(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <Textarea
                        row={3}
                        id="description"
                        name="description"
                        value={description}
                        label="Description"
                        placeholder="Description"
                        errorMessage={error.description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                          setDescription(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <ExInput
                        type="text"
                        id="uniqueId"
                        name="uniqueId"
                        value={uniqueId}
                        label="Unique ID"
                        placeholder="Unique ID"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="profileButton">
                  <Button type="submit" className="updateBtn">
                    Update Profile
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </RootLayout>
    </div>
  );
};

export default resellerProfile;