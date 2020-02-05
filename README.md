# Servmarl
Servmarl is Server side markup language. You can write python and node.js in tags.

# [Turkish] İlk Servmarl Projesi
Şimdi ilk Servmarl projemizi oluşturalım. Öncelikle herhangi adda bir klasör oluşturalım ve bu klasöre servmarlserver.exe dosyamızı ekleyelim. Sonra files.json dosyasını oluşturmamız gerekiyor. files.json sayfalarımızı tanıtmamıza yarayan bir json dosyasıdır. örnek bir files.json dosyası:
<br>
```
{
    "index":"index.html"
}
```
<br>
Burada indexin index.html olduğunu belirttik. Ama şu an index.html adında bir dosyamız yok. İndex.html dosyamızı oluşturuyoruz ve aşağıdaki örnek kodu içerisine yapıştırıyoruz.
<br>
```
<uml>
<body>
<python>
print("ilk servmarl projesi")
</python>
</body>
</uml>
```
<br>
artık servmarlserver.exe yi başlatabiliriz. Başlattığımızda server is running yazısı geliyorsa bir sorun yok demektir. Öyleyse browserdan localhost:1453 e giriyoruz ve karşımıza index sayfası çıkıyor.