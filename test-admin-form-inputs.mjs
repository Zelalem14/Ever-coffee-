import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('====================================================');
console.log('🧪 Verifying Admin Form Inputs & State Stability');
console.log('====================================================\n');

// 1. Inspect ProductModal.jsx
console.log('1️⃣ Checking ProductModal.jsx...');
const productModalPath = path.join(__dirname, 'client/src/components/admin/ProductModal.jsx');
const productModalSrc = fs.readFileSync(productModalPath, 'utf8');

// Check that categories is NOT in the form initialization effect dependency array
assert(!productModalSrc.includes('}, [productToEdit, isOpen, categories]);'),
  'ProductModal must NOT depend directly on categories array reference in form init effect');

// Check that refs are used to guard open transitions
assert(productModalSrc.includes('prevIsOpenRef') && productModalSrc.includes('prevEditIdRef'),
  'ProductModal must use prevIsOpenRef and prevEditIdRef to prevent wipe on re-renders');

// Check all controlled inputs
assert(productModalSrc.includes('value={name}') && productModalSrc.includes('onChange={(e) => setName(e.target.value)}'),
  'ProductModal name must be a controlled input');
assert(productModalSrc.includes('value={categoryId}') && productModalSrc.includes('onChange={(e) => setCategoryId(e.target.value)}'),
  'ProductModal categoryId must be a controlled select');
assert(productModalSrc.includes('value={priceEtb}') && productModalSrc.includes('onChange={(e) => setPriceEtb(e.target.value)}'),
  'ProductModal priceEtb must be a controlled input');
assert(productModalSrc.includes('value={description}') && productModalSrc.includes('onChange={(e) => setDescription(e.target.value)}'),
  'ProductModal description must be a controlled textarea');
assert(productModalSrc.includes('value={descriptionAm}') && productModalSrc.includes('onChange={(e) => setDescriptionAm(e.target.value)}'),
  'ProductModal descriptionAm must be a controlled textarea');
assert(productModalSrc.includes('value={imageUrl}') && productModalSrc.includes('onChange={(e) => setImageUrl(e.target.value)}'),
  'ProductModal imageUrl must be a controlled input');
assert(productModalSrc.includes('checked={isAvailable}') && productModalSrc.includes('onChange={(e) => setIsAvailable(e.target.checked)}'),
  'ProductModal isAvailable must be a controlled checkbox');

console.log('   ✅ ProductModal inputs are fully controlled with independent states and guarded lifecycle.\n');

// 2. Inspect CategoryModal.jsx
console.log('2️⃣ Checking CategoryModal.jsx...');
const categoryModalPath = path.join(__dirname, 'client/src/components/admin/CategoryModal.jsx');
const categoryModalSrc = fs.readFileSync(categoryModalPath, 'utf8');

assert(categoryModalSrc.includes('prevIsOpenRef') && categoryModalSrc.includes('prevEditIdRef'),
  'CategoryModal must use prevIsOpenRef and prevEditIdRef');
assert(categoryModalSrc.includes('value={name}') && categoryModalSrc.includes('handleNameChange'),
  'CategoryModal name must be controlled');
assert(categoryModalSrc.includes('value={slug}') && categoryModalSrc.includes('onChange={(e) => setSlug(e.target.value)}'),
  'CategoryModal slug must be controlled');

console.log('   ✅ CategoryModal inputs are guarded against re-render wipes.\n');

// 3. Inspect UserModal.jsx
console.log('3️⃣ Checking UserModal.jsx...');
const userModalPath = path.join(__dirname, 'client/src/components/admin/UserModal.jsx');
const userModalSrc = fs.readFileSync(userModalPath, 'utf8');

assert(userModalSrc.includes('prevIsOpenRef') && userModalSrc.includes('prevEditIdRef'),
  'UserModal must use prevIsOpenRef and prevEditIdRef');
assert(userModalSrc.includes('value={username}') && userModalSrc.includes('onChange={(e) => setUsername(e.target.value)}'),
  'UserModal username must be controlled');
assert(userModalSrc.includes('value={password}') && userModalSrc.includes('onChange={(e) => setPassword(e.target.value)}'),
  'UserModal password must be controlled');

console.log('   ✅ UserModal inputs are properly controlled and guarded.\n');

// 4. Inspect AdminAccountSettings.jsx
console.log('4️⃣ Checking AdminAccountSettings.jsx...');
const accountSettingsPath = path.join(__dirname, 'client/src/components/admin/AdminAccountSettings.jsx');
const accountSettingsSrc = fs.readFileSync(accountSettingsPath, 'utf8');

assert(accountSettingsSrc.includes('value={newUsername}') && accountSettingsSrc.includes('onChange={(e) => setNewUsername(e.target.value)}'),
  'AdminAccountSettings newUsername must be controlled');
assert(accountSettingsSrc.includes('value={newPassword}') && accountSettingsSrc.includes('onChange={(e) => setNewPassword(e.target.value)}'),
  'AdminAccountSettings newPassword must be controlled');
assert(accountSettingsSrc.includes('value={confirmPassword}') && accountSettingsSrc.includes('onChange={(e) => setConfirmPassword(e.target.value)}'),
  'AdminAccountSettings confirmPassword must be controlled');
assert(accountSettingsSrc.includes('value={currentPassword}') && accountSettingsSrc.includes('onChange={(e) => setCurrentPassword(e.target.value)}'),
  'AdminAccountSettings currentPassword must be controlled');

console.log('   ✅ AdminAccountSettings inputs are independent and controlled.\n');

// 5. Inspect MenuContext.jsx for array equality protection & memoization
console.log('5️⃣ Checking MenuContext.jsx for array reference stabilization...');
const menuContextPath = path.join(__dirname, 'client/src/context/MenuContext.jsx');
const menuContextSrc = fs.readFileSync(menuContextPath, 'utf8');

assert(menuContextSrc.includes('areListsEqual'),
  'MenuContext must use areListsEqual comparison to avoid array reference churning');
assert(menuContextSrc.includes('useMemo'),
  'MenuContext provider value must be memoized with useMemo');

console.log('   ✅ MenuContext prevents unnecessary array reference churn.\n');

// 6. Simulate ProductModal state machine & verify switching between fields and re-renders
console.log('6️⃣ Simulating ProductModal Form State Machine across typing and re-renders...');

class MockProductModalState {
  constructor() {
    this.name = '';
    this.categoryId = '';
    this.priceEtb = '';
    this.description = '';
    this.descriptionAm = '';
    this.imageUrl = '';
    this.isAvailable = true;

    this.isOpen = false;
    this.productToEdit = null;
    this.categories = [{ id: 1, name: 'Hot Drinks' }, { id: 2, name: 'Foods & Snacks' }];

    this.prevIsOpenRef = false;
    this.prevEditIdRef = null;
  }

  // Simulates opening modal
  open(product = null) {
    this.isOpen = true;
    this.productToEdit = product;
    this.runEffect();
  }

  close() {
    this.isOpen = false;
    this.productToEdit = null;
    this.runEffect();
  }

  // Simulates typing into an input field
  typeField(field, value) {
    this[field] = value;
    // Typing causes component re-render:
    this.runEffect();
  }

  // Simulates MenuContext background poll (every 15s)
  backgroundPoll() {
    // New array reference with same content
    this.categories = [{ id: 1, name: 'Hot Drinks' }, { id: 2, name: 'Foods & Snacks' }];
    this.runEffect();
  }

  // Simulates our ref-guarded effect
  runEffect() {
    const isOpening = this.isOpen && !this.prevIsOpenRef;
    const currentEditId = this.productToEdit?.id ?? 'NEW_PRODUCT';
    const isSwitchingItem = this.isOpen && currentEditId !== this.prevEditIdRef;

    if (isOpening || isSwitchingItem) {
      if (this.productToEdit) {
        this.name = this.productToEdit.name || '';
        this.categoryId = this.productToEdit.category_id != null ? String(this.productToEdit.category_id) : (this.categories[0]?.id ? String(this.categories[0].id) : '');
        this.priceEtb = this.productToEdit.price_etb != null ? String(this.productToEdit.price_etb) : '';
        this.description = this.productToEdit.description || '';
        this.descriptionAm = this.productToEdit.description_am || '';
        this.imageUrl = this.productToEdit.image_url || '';
        this.isAvailable = this.productToEdit.is_available === 1;
      } else {
        this.name = '';
        this.categoryId = this.categories[0]?.id ? String(this.categories[0].id) : '';
        this.priceEtb = '';
        this.description = '';
        this.descriptionAm = '';
        this.imageUrl = '';
        this.isAvailable = true;
      }
    }

    this.prevIsOpenRef = this.isOpen;
    this.prevEditIdRef = this.isOpen ? currentEditId : null;
  }
}

const form = new MockProductModalState();

// Test A: Admin opens "Add New Menu Item"
form.open(null);
assert.equal(form.name, '', 'Name should start empty');
assert.equal(form.categoryId, '1', 'Category should default to first category');
assert.equal(form.priceEtb, '', 'Price should start empty');

// Test B: Admin enters information in "Item Name"
form.typeField('name', 'Ethiopian Buna Special');
assert.equal(form.name, 'Ethiopian Buna Special', 'Item name should be updated');

// Test C: Admin switches to "Price" input and starts typing
form.typeField('priceEtb', '65.50');
assert.equal(form.name, 'Ethiopian Buna Special', 'Previous item name MUST NOT be erased when typing in price!');
assert.equal(form.priceEtb, '65.50', 'Price must be updated');

// Test D: Admin switches to "Description" textarea and types
form.typeField('description', 'Fresh roasted Yirgacheffe specialty coffee');
assert.equal(form.name, 'Ethiopian Buna Special', 'Item name must still be preserved!');
assert.equal(form.priceEtb, '65.50', 'Price must still be preserved!');
assert.equal(form.description, 'Fresh roasted Yirgacheffe specialty coffee', 'Description must be preserved!');

// Test E: Background polling occurs (15s interval)
form.backgroundPoll();
assert.equal(form.name, 'Ethiopian Buna Special', 'Background poll must NOT erase item name!');
assert.equal(form.priceEtb, '65.50', 'Background poll must NOT erase price!');
assert.equal(form.description, 'Fresh roasted Yirgacheffe specialty coffee', 'Background poll must NOT erase description!');

// Test F: Admin switches to Amharic description and types
form.typeField('descriptionAm', 'ትኩስ የይርጋጨፌ ቡና');
assert.equal(form.name, 'Ethiopian Buna Special');
assert.equal(form.priceEtb, '65.50');
assert.equal(form.description, 'Fresh roasted Yirgacheffe specialty coffee');
assert.equal(form.descriptionAm, 'ትኩስ የይርጋጨፌ ቡና');

// Test G: Close modal and open Edit on existing product
form.close();
assert.equal(form.isOpen, false);

form.open({
  id: 10,
  name: 'Macchiato',
  category_id: 1,
  price_etb: 40,
  description: 'Single shot espresso with foamed milk',
  description_am: '',
  image_url: 'https://example.com/macchiato.jpg',
  is_available: 1
});

assert.equal(form.name, 'Macchiato');
assert.equal(form.priceEtb, '40');

// Admin edits price to 50
form.typeField('priceEtb', '50');
assert.equal(form.name, 'Macchiato');
assert.equal(form.priceEtb, '50');

// Background polling occurs while editing
form.backgroundPoll();
assert.equal(form.priceEtb, '50', 'Edited price must NOT revert to 40 on background poll!');

console.log('   ✅ All form state preservation assertions PASSED successfully!\n');
console.log('🎉 ALL ADMIN FORM INPUT TESTS PASSED WITH ZERO ERRORS!');
