import React, { useEffect, useState } from "react";
import MultiSelectDynamic from "./components/MultiSelectDynamic"
import { date, number, object, string } from 'yup';
import { accessories, data, process, skipped, Trims } from "./data";
import Modal from "./components/Modal";

interface Option {
  value: string;
  text: string;
  selected: boolean;
  element?: HTMLElement;
}

type NewField = {
  name: string;
  value: string;
}
type Errors = {
  startDate?: string;
  endDate?: string;
  productionRate?: string;
  totalOrder?: string;
  perPiece?: string;
  status?: string;
  platform?: string
  follow_up?: string;
  assigned_to?: string;
  major_fabric?: string;
  fabric_error?: string;
  field_qty?: string;
  process_error?: string;
  trim_error?: string;
  access_error?: string;
  skip_error?: string;
  // notes?: null;
}
interface SelectedFabric {
  id: string;
  name: string;
}

interface formProps {
  startDate: string;
  endDate: string;
  productionRate: number;
  totalOrder: number;
  perPiece: number;
  unit: "M" | "KG";
  china_present: "yes" | "no";
  field_name: string;
  field_qty: string;
  fabricSelectedOptions: SelectedFabric[];
  major_fabric: string;
}

interface ModalProps {
  open: boolean;
  data: any;
}

function App() {
  const [fabricSelected, setFabricSelected] = useState<number[]>([]);
  const [fabricOptions, setFabricOptions] = useState<Option[]>([]);

  const [processSelected, setProcessSelected] = useState<number[]>([]);
  const [processOptions, setProcessOptions] = useState<Option[]>([]);

  const [skippedSelected, setSkippedSelected] = useState<number[]>([]);
  const [skippedOptions, setSkippedOptions] = useState<Option[]>([]);

  const [chinaFabricSelected, setChinaFabricSelected] = useState<number[]>([]);
  const [chinaFabricOptions, setChinaFabricOptions] = useState<Option[]>([]);

  const [trimsSelected, setTrimsSelected] = useState<number[]>([]);
  const [trimsOptions, setTrimsOptions] = useState<Option[]>([]);

  const [accessoriesSelected, setAccessoriesSelected] = useState<number[]>([]);
  const [accessoriesOptions, setAccessoriesOptions] = useState<Option[]>([]);

  const [newField, setNewField] = useState<NewField[]>([]);
  const [errors, setErrors] = useState<Errors>({
    fabric_error: '',
    process_error: '',
    trim_error: '',
    access_error: '',
    skip_error: ''
  });
  const [Modaldata, setModalData] = useState<ModalProps>({
    open: false,
    data: {}
  })
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [formData, setFormData] = useState<formProps>({
    startDate: "",
    endDate: "",
    productionRate: 0,
    totalOrder: 0,
    perPiece: 0,
    unit: "M",
    china_present: "yes",
    field_name: "",
    field_qty: "",
    fabricSelectedOptions: [],
    major_fabric: "none"
  });
  const validateSchema = object({
    startDate: date().required('Name is Required').min(4, 'Minimum 4 Character'),
    endDate: date().required('Mobile no. is required'),
    productionRate: number().required("Production Rate is Required").test('not-zero', 'Production Rate cannot be 0', (value) => value !== 0).integer('Production Rate must be a whole number'),
    totalOrder: number().required("Total Order is Required").test('not-zero', 'Total Order cannot be 0', (value) => value !== 0).integer('Total Order must be a whole number'),
    perPiece: number().required("Per Piece Requirement is Required").test('not-zero', 'Per Piece cannot be 0', (value) => value !== 0),
    major_fabric: string().required("Major Fabric is required"),
    // field_qty: number().integer("Quantity must be Whole Number")
  })

  useEffect(() => {
    const today = new Date();
    const formattedToday = formatDate(today);
    setFormData(prev => ({
      ...prev,
      startDate: formattedToday,
      endDate: formattedToday
    }))
  }, [])

  useEffect(() => {
    const selectedFabrics = fabricSelected.map(index => ({
      id: data[index].id,
      name: data[index].name
    }));

    setFormData(prevState => ({
      ...prevState,
      fabricSelectedOptions: selectedFabrics
    }));
  }, [fabricSelected]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    try {
      await validateSchema.validate({ ...formData, [name]: value }, { abortEarly: false });
      setErrors({}); // Clear any previous errors
    } catch (err: any) {
      let newErrors: { [key: string]: string } = {};
      err.inner.forEach((err: any) => {
        newErrors[err.path] = err.message;
      })
      setErrors(newErrors);
    }
  };
  const addField = () => {
    if (formData.field_name.trim() === "" && formData.field_qty.trim() === "") {
      return;
    }
    const newFieldEntry: NewField = {
      name: formData.field_name,
      value: formData.field_qty
    };
    setNewField([...newField, newFieldEntry]);
    setFormData(prevState => ({ ...prevState, field_name: '', field_qty: '' }))
  }
  function generateDString(fabricSelected: number[], data: any): string {
    const ind: string[] = [];
    fabricSelected.map(item => ind.push(data[item].name));
    return ind.length > 0 ? ind.toString() : '';
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (fabricSelected.length < 1) {
      setErrors({
        ...errors,
        fabric_error: "Please select Fabric.",
        process_error: 'Please select Process.',
        trim_error: 'Please select Trim',
        access_error: 'Please select Accessories',
      });
      return;
    }
    try {
      await validateSchema.validate({ ...formData, [name]: value }, { abortEarly: false });
      setErrors({});
      const fabSelect = generateDString(fabricSelected, data);
      const ProcessSelect = generateDString(processSelected, process);
      const stageSelect = generateDString(skippedSelected, skipped);
      const chinaSelect = generateDString(chinaFabricSelected, formData.fabricSelectedOptions);
      const TrimSelect = generateDString(trimsSelected, Trims);
      const accessoriesSelect = generateDString(accessoriesSelected, accessories);
      setModalData({
        open: true,
        data: {
          ...formData, fabric_name: fabSelect, process: ProcessSelect, skipped: stageSelect, chinaFabric: chinaSelect, Trims: TrimSelect, accessories: accessoriesSelect, color: newField
        }
      })
      const today = new Date();
      const formattedToday = formatDate(today);
      setFormData({
        startDate: formattedToday,
        endDate: formattedToday,
        productionRate: 0,
        totalOrder: 0,
        perPiece: 0,
        unit: "M",
        china_present: "yes",
        field_name: "",
        field_qty: "",
        fabricSelectedOptions: [],
        major_fabric: "none"
      });
      setFabricSelected([])
      setProcessSelected([])
      setSkippedSelected([])
      setChinaFabricSelected([])
      setTrimsSelected([])
      setAccessoriesSelected([])
      setNewField([]);
    } catch (err: any) {
      let newErrors: { [key: string]: string } = {};
      err.inner.forEach((err: any) => {
        newErrors[err.path] = err.message;
      })
      setErrors(newErrors);
    }
  }

  return (
    <div className="container mx-auto mt-7 px-4">
      <h2 className="text-3xl font-semibold text-black text-center mb-5">
        T&A DATA SUBMISSION FORM
      </h2>
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <div className="border-b border-stroke py-4 px-5 dark:border-strokedark">
          <h3 className="font-medium text-black">
            Production & Quantity
          </h3>
        </div>
        <form action="#" onSubmit={handleSubmit}>
          <div className="p-6">

            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black">
                  Select Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  onChange={handleChange}
                  value={formData.startDate}
                  min={new Date().toISOString().split('T')[0]}  // Only allow today or future dates
                  className="w-full rounded border-[1.5px] focus:border-blue-700 bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                />
                {errors?.startDate && <div className="text-red-600">{errors.startDate}</div>}
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black ">
                  Select End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  onChange={handleChange}
                  value={formData.endDate}
                  min={new Date().toISOString().split('T')[0]}  // Only allow today or future dates
                  className="w-full rounded border-[1.5px] focus:border-blue-700 active:border-blue-700 bg-transparent py-3 px-5 text-black outline-none transition disabled:cursor-default disabled:bg-whiter"
                />
                {errors?.endDate && <div className="text-red-600">{errors.endDate}</div>}
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black">
                  Production Per Day
                </label>
                <input
                  type="text"
                  name="productionRate"
                  onChange={handleChange}
                  value={formData.productionRate}
                  placeholder="Enter your Production Rate"
                  className="w-full rounded border-[1.5px] focus:border-blue-700 bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                />
                {errors?.productionRate && <div className="text-red-600">{errors.productionRate}</div>}
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black ">
                  Total Order Quantity
                </label>
                <input
                  type="text"
                  name="totalOrder"
                  onChange={handleChange}
                  value={formData.totalOrder}
                  placeholder="Enter your last name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                />
                {errors?.totalOrder && <div className="text-red-600">{errors.totalOrder}</div>}
              </div>
            </div>
          </div>

          <div className="border border-x-0 border-stroke py-4 px-5 dark:border-strokedark">
            <h3 className="font-medium text-black">
              Fabric Section
            </h3>
          </div>
          <div className="p-6">
            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black">
                  Fabric Name
                </label>
                <MultiSelectDynamic
                  id='form_fabric'
                  data={data}
                  adata={""}
                  name='form_fabric'
                  selected={fabricSelected}
                  setSelected={setFabricSelected}
                  options={fabricOptions}
                  setOptions={setFabricOptions}
                  button={false}
                />
                {errors?.fabric_error && <div className="text-red-600">{errors.fabric_error}</div>}
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black ">
                  Per Piece Requirement
                </label>
                <input
                  type="text"
                  name="perPiece"
                  onChange={handleChange}
                  value={formData.perPiece}
                  placeholder="Enter Per Piece Requirement"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                />
                {errors?.perPiece && <div className="text-red-600">{errors.perPiece}</div>}
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black">
                  Processes
                </label>
                <MultiSelectDynamic
                  id='form_process'
                  data={process}
                  adata={""}
                  name=''
                  selected={processSelected}
                  setSelected={setProcessSelected}
                  options={processOptions}
                  setOptions={setProcessOptions}
                  button={false}
                />
                {errors?.process_error && <div className="text-red-600">{errors.process_error}</div>}
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black">
                  Choose Unit
                </label>
                <div className="block">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="M"
                      name="unit"
                      type="radio"
                      value="M" // Directly set the value for this option
                      checked={formData.unit === 'M'} // Use checked to bind the state
                      onChange={() => setFormData({ ...formData, unit: 'M' })} // Handle state change
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                    />
                    <label htmlFor="M" className="block text-sm/6 font-medium text-gray-900">
                      M
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="KG"
                      name="unit"
                      type="radio"
                      value="KG" // Directly set the value for this option
                      checked={formData.unit === 'KG'} // Use checked to bind the state
                      onChange={() => setFormData({ ...formData, unit: 'KG' })} // Handle state change
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                    />
                    <label htmlFor="KG" className="block text-sm/6 font-medium text-gray-900">
                      Kg
                    </label>
                  </div>
                </div>

              </div>
            </div>
            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black">
                  Color And Quantity :
                </label>
                <div className="w-full relative">
                  <div className="absolute w-4 top-4 right-4 rounded dark:bg-white bg-boxdark cursor-pointer" onClick={addField}>
                    <div className="bg-blue-700 w-6 h-6 text-white rounded flex items-center justify-center">
                      +
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Add Color"
                    className="w-1/2 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                    value={formData.field_name}
                    onChange={handleChange}
                    name="field_name"
                  />
                  <input
                    type="number"
                    placeholder="Add Quantity"
                    className="w-1/2 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                    value={formData.field_qty}
                    onChange={handleChange}
                    name="field_qty"
                  />
                  {errors?.field_qty && <div className="text-red-600 w-1/2 ml-auto">{errors.field_qty}</div>}
                  {
                    newField.length > 0 &&
                    <div className="flex gap-2 mt-4">
                      {newField.map(item => {
                        return (
                          <span className="bg-gray-700 rounded text-white px-3 py-1">{item.name} : {item.value}</span>
                        )
                      })}
                    </div>
                  }
                  {/* </div> */}
                </div>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black ">
                  Stages to Be SKipped
                </label>
                <MultiSelectDynamic
                  id='form_skipped'
                  data={skipped}
                  adata={""}
                  name=''
                  selected={skippedSelected}
                  setSelected={setSkippedSelected}
                  options={skippedOptions}
                  setOptions={setSkippedOptions}
                  button={false}
                />
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-6">
              <div className="w-full flex gap-3">
                <label className="mb-2.5 block text-black">
                  Is China Fabric Present ? :
                </label>
                <div className="relative">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-x-1">
                      <input
                        // defaultChecked
                        id="china-yes"
                        name="yes"
                        type="radio"
                        value={formData.china_present}
                        checked={formData.china_present === 'yes'}
                        onChange={() => setFormData({ ...formData, china_present: 'yes' })} // Handle state change
                        className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                      />
                      <label htmlFor="china-yes" className="block text-sm/6 font-medium text-gray-900">
                        yes
                      </label>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <input
                        id="china-no"
                        name="no"
                        type="radio"
                        checked={formData.china_present === 'no'}
                        value={formData.china_present}
                        onChange={() => setFormData({ ...formData, china_present: 'no' })} // Handle state change
                        className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                      />
                      <label htmlFor="china-no" className="block text-sm/6 font-medium text-gray-900">
                        no
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {
                formData.china_present === 'yes'
                &&
                <div className="w-full">
                  <label className="mb-2.5 block text-black ">
                    Select China Fabric
                  </label>
                  <MultiSelectDynamic
                    id='form_china_fabric'
                    data={formData.fabricSelectedOptions}
                    adata={""}
                    name=''
                    selected={chinaFabricSelected}
                    setSelected={setChinaFabricSelected}
                    options={chinaFabricOptions}
                    setOptions={setChinaFabricOptions}
                    button={false}
                  />
                </div>
              }
            </div>
            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full">
                <label className="mb-2.5 block text-black ">
                  Choose Major Fabric
                </label>
                <select
                  id="country"
                  name="major_fabric"
                  value={formData.major_fabric}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                >
                  <option value="none">None</option>
                  {
                    formData.fabricSelectedOptions?.map(item => {
                      return (
                        <option value={item.name}>{item.name}</option>
                      )
                    })
                  }
                </select>
                {errors?.major_fabric && <div className="text-red-600">{errors.major_fabric}</div>}
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black ">
                  Trims
                </label>
                <MultiSelectDynamic
                  id='form_trims'
                  data={Trims}
                  adata={""}
                  name=''
                  selected={trimsSelected}
                  setSelected={setTrimsSelected}
                  options={trimsOptions}
                  setOptions={setTrimsOptions}
                  button={false}
                />
                {errors?.trim_error && <div className="text-red-600">{errors.trim_error}</div>}
              </div>
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black ">
                  Accessories
                </label>
                <MultiSelectDynamic
                  id='form_accessories'
                  data={accessories}
                  adata={""}
                  name=''
                  selected={accessoriesSelected}
                  setSelected={setAccessoriesSelected}
                  options={accessoriesOptions}
                  setOptions={setAccessoriesOptions}
                  button={false}
                />
                {errors?.access_error && <div className="text-red-600">{errors.access_error}</div>}
              </div>
            </div>
            <button className={`flex w-full justify-center rounded bg-blue-700 text-white p-3 font-medium text-gray hover:bg-opacity-90`}>
              Submit
            </button>
          </div>
          <Modal open={Modaldata.open} data={Modaldata.data} setData={setModalData} />
          {/* </div> */}
        </form>
      </div >
    </div >
  )
}

export default App